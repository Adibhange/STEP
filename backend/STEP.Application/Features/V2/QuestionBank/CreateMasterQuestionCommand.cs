using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Master;

namespace STEP.Application.Features.V2.QuestionBank
{
    public record CreateQuestionOptionInput(
        string Label,
        string Text,
        bool IsCorrect,
        int? DisplayOrder
    );

    public record CreateMasterQuestionCommand(
        string? Code,
        string Language,
        string SectionType,
        string QuestionType,
        string ExperienceTier,
        string QuestionText,
        decimal? Marks,
        string? SqlSchema,
        string? StarterCode,
        string? TestCases,
        List<CreateQuestionOptionInput>? Options
    ) : IRequest<QuestionBankItemDto>;

    public class CreateMasterQuestionCommandHandler(IApplicationDbContext db)
        : IRequestHandler<CreateMasterQuestionCommand, QuestionBankItemDto>
    {
        public async Task<QuestionBankItemDto> Handle(CreateMasterQuestionCommand request, CancellationToken cancellationToken)
        {
            var code = string.IsNullOrWhiteSpace(request.Code)
                ? $"QB-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}"
                : request.Code.Trim();

            var question = new MasterQuestion
            {
                Code = code,
                Language = request.Language.Trim(),
                SectionType = string.Equals(request.SectionType, "Aptitude", StringComparison.OrdinalIgnoreCase) ? "TechnicalMCQ" : request.SectionType.Trim(),
                QuestionType = request.QuestionType.Trim(),
                ExperienceTier = string.IsNullOrWhiteSpace(request.ExperienceTier) ? "Fresher" : request.ExperienceTier.Trim(),
                QuestionText = request.QuestionText.Trim(),
                Marks = request.Marks ?? 1.00m,
                SqlSchema = request.SqlSchema,
                StarterCode = request.StarterCode,
                TestCases = request.TestCases,
                IsActive = true
            };

            if (request.Options != null && request.Options.Count > 0)
            {
                int order = 1;
                foreach (var opt in request.Options)
                {
                    question.Options.Add(new MasterQuestionOption
                    {
                        OptionLabel = string.IsNullOrWhiteSpace(opt.Label) ? ((char)('A' + order - 1)).ToString() : opt.Label.Trim(),
                        OptionText = opt.Text.Trim(),
                        IsCorrect = opt.IsCorrect,
                        DisplayOrder = opt.DisplayOrder ?? order++
                    });
                }
            }

            db.MasterQuestions.Add(question);
            await db.SaveChangesAsync(cancellationToken);

            var optionsDto = question.Options.OrderBy(o => o.DisplayOrder).Select(o => new QuestionBankOptionDto(
                o.Id,
                o.OptionLabel,
                o.OptionText,
                o.IsCorrect,
                o.DisplayOrder
            )).ToList();

            return new QuestionBankItemDto(
                question.Id,
                question.Code,
                question.Language,
                question.SectionType,
                question.QuestionType,
                question.ExperienceTier,
                question.QuestionText,
                question.Marks,
                question.SqlSchema,
                question.StarterCode,
                question.TestCases,
                question.IsActive,
                question.CreatedAt.DateTime,
                question.UpdatedAt.DateTime,
                optionsDto
            );
        }
    }
}
