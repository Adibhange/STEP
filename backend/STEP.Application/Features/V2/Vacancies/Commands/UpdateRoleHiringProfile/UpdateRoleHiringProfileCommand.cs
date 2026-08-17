using System.Collections.Generic;
using MediatR;
using STEP.Application.Features.V2.Vacancies.Commands.CreateRoleHiringProfile;
using STEP.Application.Features.V2.Vacancies.Queries.GetRoleHiringProfiles;

namespace STEP.Application.Features.V2.Vacancies.Commands.UpdateRoleHiringProfile
{
    public record UpdateRoleHiringProfileCommand(
        int ProfileId,
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
