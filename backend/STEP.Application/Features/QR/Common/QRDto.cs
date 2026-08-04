using System;

namespace STEP.Application.Features.QR.Common
{
    public record QRCodeDto(
        int Id,
        int VacancyId,
        string VacancyTitle,
        string Code,
        string RegistrationUrl,
        string VenueName,
        string? VenueAddress,
        DateTime DriveDate,
        TimeSpan? DriveStartTime,
        TimeSpan? DriveEndTime,
        int? Capacity,
        DateTime? RegistrationDeadline,
        string Status);

    public record QRScanResultDto(
        int QRCodeId,
        int VacancyId,
        string VacancyTitle,
        string VenueName,
        bool IsOpenForRegistration,
        string? Message);

    public record QRCodeAnalyticsDto(
        int QRCodeId,
        int TotalScans,
        int SuccessfulRegistrations,
        decimal ConversionRate);
}
