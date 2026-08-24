using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Exam;

namespace STEP.Application.Features.V2.Blueprints
{
    public record SectionRuleInput(
        int? Id,
        string SectionName,
        string SectionType,
        string QuestionType,
        string? ExperienceTier,
        string? RequiredTags,
        int QuestionCount,
        decimal MarksPerQuestion,
        int? TimeLimitMinutes,
        string? SelectionStrategy,
        int DisplayOrder
    );

    public record SaveAssessmentTemplateCommand(
        int? Id,
        string? Code,
        string Name,
        decimal? DefaultPassingPercentage,
        bool? IsDefault,
        List<SectionRuleInput>? SectionRules
    ) : IRequest<AssessmentTemplateDto>;

    public class SaveAssessmentTemplateCommandHandler(IApplicationDbContext db)
        : IRequestHandler<SaveAssessmentTemplateCommand, AssessmentTemplateDto>
    {
        public async Task<AssessmentTemplateDto> Handle(SaveAssessmentTemplateCommand request, CancellationToken cancellationToken)
        {
            var isDefault = request.IsDefault ?? false;
            var passingCutoff = request.DefaultPassingPercentage ?? 70.00m;
            var code = string.IsNullOrWhiteSpace(request.Code) 
                ? $"RULE-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}" 
                : request.Code.Trim();

            if (isDefault)
            {
                var existingDefaults = await db.AssessmentBlueprints.Where(b => b.IsDefault).ToListAsync(cancellationToken);
                foreach (var ed in existingDefaults) ed.IsDefault = false;
            }

            AssessmentBlueprint? blueprint = null;

            if (request.Id.HasValue && request.Id.Value > 0)
            {
                blueprint = await db.AssessmentBlueprints
                    .Include(b => b.SectionRules)
                    .FirstOrDefaultAsync(b => b.Id == request.Id.Value || b.Code == code, cancellationToken);
            }
            else
            {
                blueprint = await db.AssessmentBlueprints
                    .Include(b => b.SectionRules)
                    .FirstOrDefaultAsync(b => b.Code == code, cancellationToken);
            }

            if (blueprint != null)
            {
                blueprint.Code = code;
                blueprint.Name = request.Name.Trim();
                blueprint.DefaultPassingPercentage = passingCutoff;
                blueprint.IsDefault = isDefault;
                blueprint.EnableQuestionShuffling = true;
                blueprint.EnableOptionShuffling = true;
                blueprint.IsActive = true;

                if (blueprint.SectionRules.Count > 0)
                {
                    db.AssessmentBlueprintSectionRules.RemoveRange(blueprint.SectionRules);
                }
            }
            else
            {
                blueprint = new AssessmentBlueprint
                {
                    Code = code,
                    Name = request.Name.Trim(),
                    DefaultPassingPercentage = passingCutoff,
                    EnableQuestionShuffling = true,
                    EnableOptionShuffling = true,
                    IsDefault = isDefault,
                    IsActive = true
                };
                db.AssessmentBlueprints.Add(blueprint);
            }

            await db.SaveChangesAsync(cancellationToken);

            // Add Section Rules
            var sectionRules = new List<AssessmentBlueprintSectionRule>();
            if (request.SectionRules != null && request.SectionRules.Count > 0)
            {
                int order = 1;
                foreach (var r in request.SectionRules)
                {
                    var rule = new AssessmentBlueprintSectionRule
                    {
                        BlueprintId = blueprint.Id,
                        SectionName = r.SectionName.Trim(),
                        SectionType = string.IsNullOrWhiteSpace(r.SectionType) ? "TechnicalMCQ" : r.SectionType.Trim(),
                        QuestionType = r.QuestionType ?? "SINGLE_CHOICE",
                        ExperienceTier = "{InheritFromCandidateTier}",
                        RequiredTags = string.IsNullOrWhiteSpace(r.RequiredTags) ? "{InheritFromRole}" : r.RequiredTags.Trim(),
                        QuestionCount = r.QuestionCount > 0 ? r.QuestionCount : 5,
                        MarksPerQuestion = r.MarksPerQuestion > 0 ? r.MarksPerQuestion : 1.00m,
                        TimeLimitMinutes = r.TimeLimitMinutes,
                        SelectionStrategy = string.IsNullOrWhiteSpace(r.SelectionStrategy) ? "RandomShuffled" : r.SelectionStrategy.Trim(),
                        DisplayOrder = r.DisplayOrder > 0 ? r.DisplayOrder : order++,
                        IsActive = true
                    };
                    sectionRules.Add(rule);
                    db.AssessmentBlueprintSectionRules.Add(rule);
                }

                await db.SaveChangesAsync(cancellationToken);
            }

            // Recompute totals
            blueprint.TotalQuestions = sectionRules.Sum(r => r.QuestionCount);
            blueprint.TotalMarks = sectionRules.Sum(r => r.QuestionCount * r.MarksPerQuestion);
            blueprint.TotalDurationMinutes = sectionRules.Sum(r => r.TimeLimitMinutes ?? 0);
            await db.SaveChangesAsync(cancellationToken);

            var ruleDtos = sectionRules.OrderBy(r => r.DisplayOrder).Select(r => new AssessmentSectionRuleDto(
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
            )).ToList();

            return new AssessmentTemplateDto(
                blueprint.Id,
                blueprint.Code,
                blueprint.Name,
                blueprint.DefaultPassingPercentage,
                blueprint.TotalDurationMinutes,
                blueprint.TotalQuestions,
                blueprint.TotalMarks,
                blueprint.EnableQuestionShuffling,
                blueprint.EnableOptionShuffling,
                blueprint.IsDefault,
                blueprint.IsActive,
                ruleDtos
            );
        }
    }
}
