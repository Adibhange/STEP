using System;
using System.Collections.Generic;

namespace STEP.Application.Features.Vacancies.Common
{
    public record PipelineRoundDto(int Id, int RoundOrder, string Name, string RoundType, decimal CutoffPercent);

    public record PipelineFlowDto(int Id, string VersionName, string? Description, bool IsDefault, List<PipelineRoundDto> Rounds);

    public record AssessmentSectionDto(int Id, int SectionOrder, string SectionTitle, int TotalQuestions, int TimeLimitMinutes, decimal MarksPerQuestion, decimal TotalMarks);

    public record VacancySummaryDto(
        int Id,
        string VacancyCode,
        string Title,
        string Department,
        string HiringLocation,
        string DriveType,
        string Status,
        int TotalOpenings,
        DateTime? ClosingDate);

    public record VacancyDto(
        int Id,
        string VacancyCode,
        string Title,
        string MasterRole,
        string Department,
        string HiringLocation,
        string EmploymentType,
        string DriveType,
        string Status,
        string WorkMode,
        int TotalOpenings,
        decimal MinExperienceYears,
        decimal MaxExperienceYears,
        string? JobDescription,
        DateTime? ClosingDate,
        DateTime? WalkinDriveDate,
        List<string> TestLocations,
        List<PipelineFlowDto> PipelineFlows,
        List<AssessmentSectionDto> AssessmentSections);

    public record VacancyListResultDto(List<VacancySummaryDto> Items, int TotalCount);
}
