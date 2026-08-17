using System;

namespace STEP.Application.Features.V2.Vacancies.Commands.CreateInstantDrive
{
    public record InstantDriveResultDto(
        int VacancyId,
        string VacancyCode,
        string Title,
        string ProfileName,
        string DepartmentName,
        string HiringLocationName,
        int TotalOpenings,
        decimal MinExperienceYears,
        decimal MaxExperienceYears,
        decimal PassingPercentage,
        string QuestionPaperTitle,
        int TotalQuestions,
        int DurationMinutes,
        int QRCodeId,
        string QRCodeString,
        string RegistrationUrl,
        string QrCodeDataUrl
    );
}
