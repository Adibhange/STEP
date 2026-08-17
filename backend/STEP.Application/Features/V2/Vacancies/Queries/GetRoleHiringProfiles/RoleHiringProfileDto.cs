using System.Collections.Generic;
using STEP.Application.Common.Services;

namespace STEP.Application.Features.V2.Vacancies.Queries.GetRoleHiringProfiles
{
    public record RoleAssessmentSectionRuleDto(
        int Id,
        int RoleHiringProfileId,
        string SectionName,
        string SectionType,
        string QuestionType,
        string Difficulty,
        string RequiredTags,
        int QuestionCount,
        decimal MarksPerQuestion,
        int? TimeLimitMinutes,
        string? ProgrammingLanguage,
        string SelectionStrategy,
        int DisplayOrder,
        bool IsActive
    );

    public record RoleHiringProfileDto(
        int Id,
        int MasterRoleId,
        string RoleName,
        string ProfileName,
        int? ExperienceLevelId,
        string? ExperienceLevelName,
        decimal MinExperienceYears,
        decimal MaxExperienceYears,
        int? QuestionPaperTemplateId,
        string? QuestionPaperTitle,
        decimal PassingPercentage,
        int? PipelineFlowTemplateId,
        bool AutoAdvanceOnPass,
        bool AutoRejectOnFail,
        bool AutoPrepareOfferOnFinalPass,
        decimal? DefaultBaseCTC,
        bool IsDefault,
        bool IsActive,
        List<RoleAssessmentSectionRuleDto> SectionRules,
        PoolValidationResult? PoolValidationStatus = null
    );
}
