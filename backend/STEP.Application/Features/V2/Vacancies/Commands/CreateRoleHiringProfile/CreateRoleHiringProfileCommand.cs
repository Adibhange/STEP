using System.Collections.Generic;
using MediatR;
using STEP.Application.Features.V2.Vacancies.Queries.GetRoleHiringProfiles;

namespace STEP.Application.Features.V2.Vacancies.Commands.CreateRoleHiringProfile
{
    public record CreateAssessmentSectionRuleInput(
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
        int DisplayOrder
    );

    public record CreateRoleHiringProfileCommand(
        int MasterRoleId,
        string ProfileName,
        int? ExperienceLevelId,
        decimal MinExperienceYears,
        decimal MaxExperienceYears,
        decimal PassingPercentage,
        decimal? DefaultBaseCTC,
        bool AutoAdvanceOnPass,
        bool AutoRejectOnFail,
        bool AutoPrepareOfferOnFinalPass,
        bool IsDefault,
        List<CreateAssessmentSectionRuleInput>? SectionRules
    ) : IRequest<RoleHiringProfileDto>;
}
