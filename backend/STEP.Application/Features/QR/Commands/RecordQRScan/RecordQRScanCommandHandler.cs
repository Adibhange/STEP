using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.QR.Common;
using STEP.Domain.Entities.QR;

namespace STEP.Application.Features.QR.Commands.RecordQRScan
{
    public class RecordQRScanCommandHandler(IApplicationDbContext db) : IRequestHandler<RecordQRScanCommand, QRScanResultDto>
    {
        public async Task<QRScanResultDto> Handle(RecordQRScanCommand request, CancellationToken cancellationToken)
        {
            var qrCode = await db.QRCodes
                .Include(q => q.Vacancy)
                .FirstOrDefaultAsync(q => q.Code == request.Code, cancellationToken);

            if (qrCode == null)
            {
                var vacancy = await db.Vacancies
                    .FirstOrDefaultAsync(v => v.VacancyCode == request.Code, cancellationToken);

                if (vacancy != null)
                {
                    qrCode = await db.QRCodes
                        .Include(q => q.Vacancy)
                        .FirstOrDefaultAsync(q => q.VacancyId == vacancy.Id, cancellationToken);

                    if (qrCode == null)
                    {
                        qrCode = new QRCode
                        {
                            VacancyId = vacancy.Id,
                            Code = $"QR-{vacancy.VacancyCode}",
                            RegistrationUrl = $"/apply/{vacancy.VacancyCode}",
                            VenueName = vacancy.Title,
                            DriveDate = vacancy.WalkinDriveDate ?? DateTime.UtcNow.Date,
                            Capacity = 500,
                            RegistrationDeadline = DateTime.UtcNow.AddMonths(1),
                            Status = "Active"
                        };
                        db.QRCodes.Add(qrCode);
                        await db.SaveChangesAsync(cancellationToken);
                        qrCode.Vacancy = vacancy;
                    }
                }
            }

            if (qrCode == null)
            {
                throw new NotFoundException(nameof(QRCode), request.Code);
            }

            var registrationCount = await db.Candidates.CountAsync(c => c.QRCodeId == qrCode.Id, cancellationToken);
            var (isOpen, message) = QRCodeAvailability.Check(qrCode, registrationCount);

            db.QRScanAnalytics.Add(new QRScanAnalytic
            {
                QRCodeId = qrCode.Id,
                IpAddress = request.IpAddress,
                UserAgent = request.UserAgent,
                ResultedInRegistration = false,
            });

            await db.SaveChangesAsync(cancellationToken);

            return new QRScanResultDto(qrCode.Id, qrCode.VacancyId, qrCode.Vacancy.Title, qrCode.VenueName, isOpen, message);
        }
    }
}
