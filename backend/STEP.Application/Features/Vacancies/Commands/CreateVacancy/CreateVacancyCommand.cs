using System;
using System.Collections.Generic;
using MediatR;
using STEP.Application.Features.Vacancies.Common;

namespace STEP.Application.Features.Vacancies.Commands.CreateVacancy
{
    public record CreateRoundInput(int RoundOrder, string Name, string RoundType, decimal CutoffPercent);

    public record CreatePipelineFlowInput(string VersionName, string? Description, bool IsDefault, List<CreateRoundInput> Rounds);

    public record CreateAssessmentSectionInput(int SectionOrder, string SectionTitle, int TotalQuestions, int TimeLimitMinutes, decimal MarksPerQuestion);

    /// <summary>
    /// Mirrors the frontend's 4-step vacancy creation wizard: Basic Info + Terms/Locations,
    /// Pipeline Flow Versions, Assessment Pattern, Review & Publish — saved atomically.
    /// </summary>
    public record CreateVacancyCommand(
        string Title,
        int MasterRoleId,
        int DepartmentId,
        int HiringLocationId,
        int EmploymentTypeId,
        string DriveType,
        string WorkMode,
        int TotalOpenings,
        decimal MinExperienceYears,
        decimal MaxExperienceYears,
        string? JobDescription,
        DateTime? ClosingDate,
        DateTime? WalkinDriveDate,
        TimeSpan? WalkinStartTime,
        TimeSpan? WalkinEndTime,
        int? AssignedRecruiterId,
        int? HiringManagerId,
        string Status,
        List<CreatePipelineFlowInput> PipelineFlows,
        List<CreateAssessmentSectionInput> AssessmentSections,
        List<int>? TestLocationIds = null) : IRequest<VacancyDto>;
}
