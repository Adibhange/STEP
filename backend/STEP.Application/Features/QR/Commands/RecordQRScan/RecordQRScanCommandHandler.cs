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
                    .ThenInclude(v => v.Department)
                .Include(q => q.Vacancy)
                    .ThenInclude(v => v.HiringLocation)
                .FirstOrDefaultAsync(q => q.Code == request.Code, cancellationToken);

            if (qrCode == null)
            {
                var vacancy = await db.Vacancies
                    .Include(v => v.Department)
                    .Include(v => v.HiringLocation)
                    .FirstOrDefaultAsync(v => v.VacancyCode == request.Code, cancellationToken);

                if (vacancy == null && int.TryParse(request.Code, out int numericId))
                {
                    vacancy = await db.Vacancies
                        .Include(v => v.Department)
                        .Include(v => v.HiringLocation)
                        .FirstOrDefaultAsync(v => v.Id == numericId, cancellationToken);
                }

                if (vacancy != null)
                {
                    qrCode = await db.QRCodes
                        .Include(q => q.Vacancy)
                            .ThenInclude(v => v.Department)
                        .Include(q => q.Vacancy)
                            .ThenInclude(v => v.HiringLocation)
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

            var vac = qrCode.Vacancy;
            return new QRScanResultDto(
                qrCode.Id,
                qrCode.VacancyId,
                vac?.Title ?? "Open Position",
                qrCode.VenueName ?? vac?.HiringLocation?.Name ?? "Main Office",
                isOpen,
                message,
                vac?.DriveType ?? "Walk-in Drive",
                vac?.Department?.Name,
                vac?.HiringLocation?.Name,
                vac?.TotalOpenings,
                vac?.VacancyCode
            );
        }
    }
}
