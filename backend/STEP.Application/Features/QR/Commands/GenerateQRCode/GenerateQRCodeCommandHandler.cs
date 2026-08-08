using System;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.QR.Common;
using STEP.Domain.Entities.QR;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;

namespace STEP.Application.Features.QR.Commands.GenerateQRCode
{
    public class GenerateQRCodeCommandHandler(IApplicationDbContext db, IConfiguration configuration)
        : IRequestHandler<GenerateQRCodeCommand, QRCodeDto>
    {

        public async Task<QRCodeDto> Handle(GenerateQRCodeCommand request, CancellationToken cancellationToken)
        {
            var vacancy = await db.Vacancies.FirstOrDefaultAsync(v => v.Id == request.VacancyId, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyEntity), request.VacancyId);

            // No hardcoded fallback domain here — a silently-wrong guess would bake an unreachable
            // (or someone else's) URL into every QR code candidates scan. Must be configured in the
            // backend .env; see FRONTEND_URL in .env.example.
            var frontendUrlRaw = configuration["FRONTEND_URL"];
            if (string.IsNullOrWhiteSpace(frontendUrlRaw))
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.VenueName),
                    "'FRONTEND_URL' is not configured on the server. Set it in the backend .env (the public URL candidates' QR scans should open) before generating QR codes.")]);
            }
            var frontendUrl = frontendUrlRaw.TrimEnd('/');
            var code = $"WD-{Convert.ToHexString(RandomNumberGenerator.GetBytes(4))}";
            var registrationUrl = $"{frontendUrl}/apply/{code}";

            var qrCode = new QRCode
            {
                VacancyId = request.VacancyId,
                Code = code,
                RegistrationUrl = registrationUrl,
                VenueName = request.VenueName,
                VenueAddress = request.VenueAddress,
                DriveDate = request.DriveDate,
                DriveStartTime = request.DriveStartTime,
                DriveEndTime = request.DriveEndTime,
                Capacity = request.Capacity,
                RegistrationDeadline = request.RegistrationDeadline,
                Status = "Active",
            };

            db.QRCodes.Add(qrCode);
            await db.SaveChangesAsync(cancellationToken);

            return new QRCodeDto(
                qrCode.Id, qrCode.VacancyId, vacancy.Title, qrCode.Code, qrCode.RegistrationUrl, qrCode.VenueName,
                qrCode.VenueAddress, qrCode.DriveDate, qrCode.DriveStartTime, qrCode.DriveEndTime, qrCode.Capacity,
                qrCode.RegistrationDeadline, qrCode.Status);
        }
    }
}
