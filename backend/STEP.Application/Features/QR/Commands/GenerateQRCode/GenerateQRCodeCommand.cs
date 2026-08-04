using System;
using MediatR;
using STEP.Application.Features.QR.Common;

namespace STEP.Application.Features.QR.Commands.GenerateQRCode
{
    public record GenerateQRCodeCommand(
        int VacancyId,
        string VenueName,
        string? VenueAddress,
        DateTime DriveDate,
        TimeSpan? DriveStartTime,
        TimeSpan? DriveEndTime,
        int? Capacity,
        DateTime? RegistrationDeadline) : IRequest<QRCodeDto>;
}
