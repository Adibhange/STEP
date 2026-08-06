using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.QR.Common;

namespace STEP.Application.Features.QR.Queries.GetQRCodeByVacancy
{
    public class GetQRCodeByVacancyQueryHandler(IApplicationDbContext db) : IRequestHandler<GetQRCodeByVacancyQuery, QRCodeDto?>
    {
        public async Task<QRCodeDto?> Handle(GetQRCodeByVacancyQuery request, CancellationToken cancellationToken)
        {
            var qrCode = await db.QRCodes
                .Include(q => q.Vacancy)
                .Where(q => q.VacancyId == request.VacancyId)
                .OrderByDescending(q => q.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (qrCode == null)
            {
                return null;
            }

            return new QRCodeDto(
                qrCode.Id, qrCode.VacancyId, qrCode.Vacancy.Title, qrCode.Code, qrCode.RegistrationUrl, qrCode.VenueName,
                qrCode.VenueAddress, qrCode.DriveDate, qrCode.DriveStartTime, qrCode.DriveEndTime, qrCode.Capacity,
                qrCode.RegistrationDeadline, qrCode.Status);
        }
    }
}
