using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;

namespace STEP.Application.Features.V2.Blueprints
{
    public record GetAssessmentTemplatesQuery : IRequest<List<AssessmentTemplateDto>>;

    public class GetAssessmentTemplatesQueryHandler(IApplicationDbContext db)
        : IRequestHandler<GetAssessmentTemplatesQuery, List<AssessmentTemplateDto>>
    {
        public async Task<List<AssessmentTemplateDto>> Handle(GetAssessmentTemplatesQuery request, CancellationToken cancellationToken)
        {
            var blueprints = await db.AssessmentBlueprints
                .Include(b => b.SectionRules.Where(r => r.IsActive))
                .Where(b => b.IsActive)
                .OrderBy(b => b.Id)
                .ToListAsync(cancellationToken);

            return blueprints.Select(b => new AssessmentTemplateDto(
                b.Id,
                b.Code,
                b.Name,
                b.DefaultPassingPercentage,
                b.TotalDurationMinutes,
                b.TotalQuestions,
                b.TotalMarks,
                b.EnableQuestionShuffling,
                b.EnableOptionShuffling,
                b.IsDefault,
                b.IsActive,
                b.SectionRules.OrderBy(r => r.DisplayOrder).Select(r => new AssessmentSectionRuleDto(
                    r.Id,
                    r.BlueprintId,
                    r.SectionName,
                    r.SectionType,
                    r.QuestionType,
                    r.ExperienceTier,
                    r.RequiredTags,
                    r.QuestionCount,
                    r.MarksPerQuestion,
                    r.TimeLimitMinutes,
                    r.SelectionStrategy,
                    r.DisplayOrder,
                    r.IsActive
                )).ToList()
            )).ToList();
        }
    }
}
