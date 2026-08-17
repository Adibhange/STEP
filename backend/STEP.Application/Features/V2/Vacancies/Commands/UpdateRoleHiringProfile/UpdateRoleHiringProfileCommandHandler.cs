using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Services;
using STEP.Application.Features.V2.Vacancies.Queries.GetRoleHiringProfiles;
using STEP.Domain.Entities.Master;

namespace STEP.Application.Features.V2.Vacancies.Commands.UpdateRoleHiringProfile
{
    public class UpdateRoleHiringProfileCommandHandler(IApplicationDbContext db, IDynamicQuestionSampler sampler)
        : IRequestHandler<UpdateRoleHiringProfileCommand, RoleHiringProfileDto>
    {
        public async Task<RoleHiringProfileDto> Handle(UpdateRoleHiringProfileCommand request, CancellationToken cancellationToken)
        {
            var profile = await db.RoleHiringProfiles
                .Include(p => p.MasterRole)
                .Include(p => p.SectionRules)
                .FirstOrDefaultAsync(p => p.Id == request.ProfileId, cancellationToken)
                ?? throw new System.Exception($"RoleHiringProfile ID {request.ProfileId} not found.");

            if (request.IsDefault)
            {
                var existingProfiles = await db.RoleHiringProfiles
                    .Where(p => p.MasterRoleId == profile.MasterRoleId && p.Id != profile.Id && p.IsActive)
                    .ToListAsync(cancellationToken);

                foreach (var ep in existingProfiles)
                {
                    ep.IsDefault = false;
                }
            }

            profile.ProfileName = request.ProfileName;
            profile.ExperienceLevelId = request.ExperienceLevelId;
            profile.MinExperienceYears = request.MinExperienceYears;
            profile.MaxExperienceYears = request.MaxExperienceYears;
            profile.PassingPercentage = request.PassingPercentage;
            profile.DefaultBaseCTC = request.DefaultBaseCTC;
            profile.AutoAdvanceOnPass = request.AutoAdvanceOnPass;
            profile.AutoRejectOnFail = request.AutoRejectOnFail;
            profile.AutoPrepareOfferOnFinalPass = request.AutoPrepareOfferOnFinalPass;
            profile.IsDefault = request.IsDefault;

            // Replace Section Rules
            if (request.SectionRules != null)
            {
                db.RoleAssessmentSectionRules.RemoveRange(profile.SectionRules);

                int order = 1;
                foreach (var ruleInput in request.SectionRules)
                {
                    var rule = new RoleAssessmentSectionRule
                    {
                        RoleHiringProfileId = profile.Id,
                        SectionName = ruleInput.SectionName,
                        SectionType = ruleInput.SectionType,
                        QuestionType = ruleInput.QuestionType,
                        Difficulty = ruleInput.Difficulty,
                        RequiredTags = ruleInput.RequiredTags,
                        QuestionCount = ruleInput.QuestionCount,
                        MarksPerQuestion = ruleInput.MarksPerQuestion,
                        TimeLimitMinutes = ruleInput.TimeLimitMinutes,
                        ProgrammingLanguage = ruleInput.ProgrammingLanguage,
                        SelectionStrategy = ruleInput.SelectionStrategy,
                        DisplayOrder = ruleInput.DisplayOrder > 0 ? ruleInput.DisplayOrder : order++,
                        IsActive = true
                    };
                    db.RoleAssessmentSectionRules.Add(rule);
                }
            }

            await db.SaveChangesAsync(cancellationToken);

            var updatedRules = await db.RoleAssessmentSectionRules
                .Where(r => r.RoleHiringProfileId == profile.Id && r.IsActive)
                .OrderBy(r => r.DisplayOrder)
                .ToListAsync(cancellationToken);

            var sectionDtos = updatedRules.Select(r => new RoleAssessmentSectionRuleDto(
                r.Id,
                r.RoleHiringProfileId,
                r.SectionName,
                r.SectionType,
                r.QuestionType,
                r.Difficulty,
                r.RequiredTags,
                r.QuestionCount,
                r.MarksPerQuestion,
                r.TimeLimitMinutes,
                r.ProgrammingLanguage,
                r.SelectionStrategy,
                r.DisplayOrder,
                r.IsActive
            )).ToList();

            var poolStatus = await sampler.ValidatePoolAvailabilityAsync(profile.Id, cancellationToken);

            return new RoleHiringProfileDto(
                profile.Id,
                profile.MasterRoleId,
                profile.MasterRole.Name,
                profile.ProfileName,
                profile.ExperienceLevelId,
                null,
                profile.MinExperienceYears,
                profile.MaxExperienceYears,
                null,
                null,
                profile.PassingPercentage,
                profile.PipelineFlowTemplateId,
                profile.AutoAdvanceOnPass,
                profile.AutoRejectOnFail,
                profile.AutoPrepareOfferOnFinalPass,
                profile.DefaultBaseCTC,
                profile.IsDefault,
                profile.IsActive,
                sectionDtos,
                poolStatus
            );
        }
    }
}
