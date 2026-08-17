using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Services;

namespace STEP.Application.Features.V2.Vacancies.Queries.GetRoleHiringProfiles
{
    public class GetRoleHiringProfilesQueryHandler(IApplicationDbContext db, IDynamicQuestionSampler sampler)
        : IRequestHandler<GetRoleHiringProfilesQuery, List<RoleHiringProfileDto>>
    {
        public async Task<List<RoleHiringProfileDto>> Handle(GetRoleHiringProfilesQuery request, CancellationToken cancellationToken)
        {
            var profiles = await db.RoleHiringProfiles
                .Include(p => p.MasterRole)
                .Include(p => p.ExperienceLevel)
                .Include(p => p.SectionRules)
                .Where(p => p.MasterRoleId == request.MasterRoleId && p.IsActive)
                .OrderByDescending(p => p.IsDefault)
                .ThenBy(p => p.MinExperienceYears)
                .ToListAsync(cancellationToken);

            var paperIds = profiles
                .Where(p => p.QuestionPaperTemplateId.HasValue)
                .Select(p => p.QuestionPaperTemplateId!.Value)
                .Distinct()
                .ToList();

            var paperTitles = await db.VacancyQuestionPapers
                .Where(p => paperIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => p.Title, cancellationToken);

            var result = new List<RoleHiringProfileDto>();

            foreach (var p in profiles)
            {
                var sectionDtos = p.SectionRules
                    .Where(r => r.IsActive)
                    .OrderBy(r => r.DisplayOrder)
                    .Select(r => new RoleAssessmentSectionRuleDto(
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
                    ))
                    .ToList();

                var poolStatus = await sampler.ValidatePoolAvailabilityAsync(p.Id, cancellationToken);

                result.Add(new RoleHiringProfileDto(
                    p.Id,
                    p.MasterRoleId,
                    p.MasterRole.Name,
                    p.ProfileName,
                    p.ExperienceLevelId,
                    p.ExperienceLevel?.Name,
                    p.MinExperienceYears,
                    p.MaxExperienceYears,
                    p.QuestionPaperTemplateId,
                    p.QuestionPaperTemplateId.HasValue && paperTitles.TryGetValue(p.QuestionPaperTemplateId.Value, out var title) ? title : null,
                    p.PassingPercentage,
                    p.PipelineFlowTemplateId,
                    p.AutoAdvanceOnPass,
                    p.AutoRejectOnFail,
                    p.AutoPrepareOfferOnFinalPass,
                    p.DefaultBaseCTC,
                    p.IsDefault,
                    p.IsActive,
                    sectionDtos,
                    poolStatus
                ));
            }

            return result;
        }
    }
}
