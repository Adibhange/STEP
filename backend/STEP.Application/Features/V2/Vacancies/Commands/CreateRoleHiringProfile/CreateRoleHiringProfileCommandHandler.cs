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

namespace STEP.Application.Features.V2.Vacancies.Commands.CreateRoleHiringProfile
{
    public class CreateRoleHiringProfileCommandHandler(IApplicationDbContext db, IDynamicQuestionSampler sampler)
        : IRequestHandler<CreateRoleHiringProfileCommand, RoleHiringProfileDto>
    {
        public async Task<RoleHiringProfileDto> Handle(CreateRoleHiringProfileCommand request, CancellationToken cancellationToken)
        {
            var role = await db.MasterRoles.FirstOrDefaultAsync(r => r.Id == request.MasterRoleId, cancellationToken)
                ?? throw new System.Exception($"MasterRole ID {request.MasterRoleId} not found.");

            if (request.IsDefault)
            {
                var existingProfiles = await db.RoleHiringProfiles
                    .Where(p => p.MasterRoleId == request.MasterRoleId && p.IsActive)
                    .ToListAsync(cancellationToken);

                foreach (var ep in existingProfiles)
                {
                    ep.IsDefault = false;
                }
            }

            var profile = new RoleHiringProfile
            {
                MasterRoleId = request.MasterRoleId,
                ProfileName = request.ProfileName,
                ExperienceLevelId = request.ExperienceLevelId,
                MinExperienceYears = request.MinExperienceYears,
                MaxExperienceYears = request.MaxExperienceYears,
                PassingPercentage = request.PassingPercentage,
                DefaultBaseCTC = request.DefaultBaseCTC,
                AutoAdvanceOnPass = request.AutoAdvanceOnPass,
                AutoRejectOnFail = request.AutoRejectOnFail,
                AutoPrepareOfferOnFinalPass = request.AutoPrepareOfferOnFinalPass,
                IsDefault = request.IsDefault,
                IsActive = true
            };

            db.RoleHiringProfiles.Add(profile);
            await db.SaveChangesAsync(cancellationToken); // SQL Server generates profile.Id (IDENTITY(1,1))

            var sectionRules = new List<RoleAssessmentSectionRule>();
            if (request.SectionRules != null && request.SectionRules.Count > 0)
            {
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
                    sectionRules.Add(rule);
                    db.RoleAssessmentSectionRules.Add(rule);
                }

                await db.SaveChangesAsync(cancellationToken); // SQL Server generates rule.Id (IDENTITY(1,1))
            }

            var sectionDtos = sectionRules.Select(r => new RoleAssessmentSectionRuleDto(
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
                role.Name,
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
