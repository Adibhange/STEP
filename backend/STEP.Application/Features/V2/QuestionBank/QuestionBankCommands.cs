using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Master;

namespace STEP.Application.Features.V2.QuestionBank
{
    public record UpdateMasterQuestionCommand(
        int Id,
        string? Code,
        string Language,
        string SectionType,
        string QuestionType,
        string ExperienceTier,
        string QuestionText,
        decimal Marks,
        string? SqlSchema,
        string? StarterCode,
        string? TestCases,
        bool IsActive,
        List<CreateQuestionOptionInput>? Options
    ) : IRequest<QuestionBankItemDto>;

    public class UpdateMasterQuestionCommandHandler(IApplicationDbContext db)
        : IRequestHandler<UpdateMasterQuestionCommand, QuestionBankItemDto>
    {
        public async Task<QuestionBankItemDto> Handle(UpdateMasterQuestionCommand request, CancellationToken cancellationToken)
        {
            var question = await db.MasterQuestions
                .Include(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == request.Id, cancellationToken)
                ?? throw new Exception($"MasterQuestion ID {request.Id} not found.");

            if (!string.IsNullOrWhiteSpace(request.Code))
                question.Code = request.Code.Trim();

            question.Language = request.Language.Trim();
            question.SectionType = string.Equals(request.SectionType, "Aptitude", StringComparison.OrdinalIgnoreCase) ? "TechnicalMCQ" : request.SectionType.Trim();
            question.QuestionType = request.QuestionType.Trim();
            question.ExperienceTier = request.ExperienceTier.Trim();
            question.QuestionText = request.QuestionText.Trim();
            question.Marks = request.Marks > 0 ? request.Marks : 1.00m;
            question.SqlSchema = request.SqlSchema;
            question.StarterCode = request.StarterCode;
            question.TestCases = request.TestCases;
            question.IsActive = request.IsActive;

            db.MasterQuestionOptions.RemoveRange(question.Options);

            if (request.Options != null && request.Options.Count > 0)
            {
                int order = 1;
                foreach (var opt in request.Options)
                {
                    question.Options.Add(new MasterQuestionOption
                    {
                        MasterQuestionId = question.Id,
                        OptionLabel = string.IsNullOrWhiteSpace(opt.Label) ? ((char)('A' + order - 1)).ToString() : opt.Label.Trim(),
                        OptionText = opt.Text.Trim(),
                        IsCorrect = opt.IsCorrect,
                        DisplayOrder = opt.DisplayOrder ?? order++
                    });
                }
            }

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

    public record DeleteMasterQuestionCommand(int Id) : IRequest<bool>;

    public class DeleteMasterQuestionCommandHandler(IApplicationDbContext db)
        : IRequestHandler<DeleteMasterQuestionCommand, bool>
    {
        public async Task<bool> Handle(DeleteMasterQuestionCommand request, CancellationToken cancellationToken)
        {
            var q = await db.MasterQuestions.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            if (q != null)
            {
                q.IsActive = false;
                await db.SaveChangesAsync(cancellationToken);
                return true;
            }
            return false;
        }
    }

    public record BulkDeleteQuestionsCommand(List<int> QuestionIds) : IRequest<int>;

    public class BulkDeleteQuestionsCommandHandler(IApplicationDbContext db)
        : IRequestHandler<BulkDeleteQuestionsCommand, int>
    {
        public async Task<int> Handle(BulkDeleteQuestionsCommand request, CancellationToken cancellationToken)
        {
            if (request.QuestionIds == null || request.QuestionIds.Count == 0) return 0;

            var questions = await db.MasterQuestions
                .Where(q => request.QuestionIds.Contains(q.Id))
                .ToListAsync(cancellationToken);

            foreach (var q in questions) q.IsActive = false;

            await db.SaveChangesAsync(cancellationToken);
            return questions.Count;
        }
    }

    public record BulkToggleQuestionStatusCommand(List<int> QuestionIds, bool IsActive) : IRequest<int>;

    public class BulkToggleQuestionStatusCommandHandler(IApplicationDbContext db)
        : IRequestHandler<BulkToggleQuestionStatusCommand, int>
    {
        public async Task<int> Handle(BulkToggleQuestionStatusCommand request, CancellationToken cancellationToken)
        {
            if (request.QuestionIds == null || request.QuestionIds.Count == 0) return 0;

            var questions = await db.MasterQuestions
                .Where(q => request.QuestionIds.Contains(q.Id))
                .ToListAsync(cancellationToken);

            foreach (var q in questions) q.IsActive = request.IsActive;

            await db.SaveChangesAsync(cancellationToken);
            return questions.Count;
        }
    }

    public record BulkImportQuestionsCommand(List<CreateMasterQuestionCommand> Questions) : IRequest<int>;

    public class BulkImportQuestionsCommandHandler(IApplicationDbContext db)
        : IRequestHandler<BulkImportQuestionsCommand, int>
    {
        public async Task<int> Handle(BulkImportQuestionsCommand request, CancellationToken cancellationToken)
        {
            if (request.Questions == null || request.Questions.Count == 0) return 0;

            int count = 0;
            foreach (var req in request.Questions)
            {
                var code = string.IsNullOrWhiteSpace(req.Code)
                    ? $"QB-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}"
                    : req.Code.Trim();

                var q = new MasterQuestion
                {
                    Code = code,
                    Language = req.Language.Trim(),
                    SectionType = string.Equals(req.SectionType, "Aptitude", StringComparison.OrdinalIgnoreCase) ? "TechnicalMCQ" : req.SectionType.Trim(),
                    QuestionType = req.QuestionType.Trim(),
                    ExperienceTier = string.IsNullOrWhiteSpace(req.ExperienceTier) ? "Fresher" : req.ExperienceTier.Trim(),
                    QuestionText = req.QuestionText.Trim(),
                    Marks = req.Marks ?? 1.00m,
                    SqlSchema = req.SqlSchema,
                    StarterCode = req.StarterCode,
                    TestCases = req.TestCases,
                    IsActive = true
                };

                if (req.Options != null && req.Options.Count > 0)
                {
                    int order = 1;
                    foreach (var opt in req.Options)
                    {
                        q.Options.Add(new MasterQuestionOption
                        {
                            OptionLabel = string.IsNullOrWhiteSpace(opt.Label) ? ((char)('A' + order - 1)).ToString() : opt.Label.Trim(),
                            OptionText = opt.Text.Trim(),
                            IsCorrect = opt.IsCorrect,
                            DisplayOrder = opt.DisplayOrder ?? order++
                        });
                    }
                }

                db.MasterQuestions.Add(q);
                count++;
            }

            await db.SaveChangesAsync(cancellationToken);
            return count;
        }
    }
}
