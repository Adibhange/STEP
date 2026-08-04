using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.QuestionPapers.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Application.Features.QuestionPapers.Commands.PublishQuestionPaper
{
    /// <summary>
    /// Atomic publish transaction with the blueprint's strict validation checklist. Published
    /// papers become read-only — no further edits/deletes — and are safe to assign to candidates.
    /// </summary>
    public class PublishQuestionPaperCommandHandler(IApplicationDbContext db) : IRequestHandler<PublishQuestionPaperCommand, QuestionPaperDto>
    {
        public async Task<QuestionPaperDto> Handle(PublishQuestionPaperCommand request, CancellationToken cancellationToken)
        {
            var paper = await db.VacancyQuestionPapers
                .Include(p => p.Vacancy).ThenInclude(v => v.AssessmentSections)
                .Include(p => p.Questions).ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(p => p.Id == request.VacancyQuestionPaperId, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyQuestionPaper), request.VacancyQuestionPaperId);

            if (paper.Status != "Draft")
            {
                throw new ValidationException([new ValidationFailure(nameof(paper.Status), $"Only Draft papers can be published (current status: '{paper.Status}').")]);
            }

            var failures = new System.Collections.Generic.List<ValidationFailure>();

            // 1. Total questions must match the vacancy's assessment section pattern.
            var expectedQuestionCount = paper.Vacancy.AssessmentSections.Sum(s => s.TotalQuestions);
            if (paper.Questions.Count != expectedQuestionCount)
            {
                failures.Add(new ValidationFailure(nameof(paper.TotalQuestions),
                    $"Paper has {paper.Questions.Count} question(s) but the assessment pattern requires {expectedQuestionCount}."));
            }

            // 2. Total marks must match the section pattern's total marks.
            var expectedMarks = paper.Vacancy.AssessmentSections.Sum(s => s.TotalMarks);
            var actualMarks = paper.Questions.Sum(q => q.Marks);
            if (actualMarks != expectedMarks)
            {
                failures.Add(new ValidationFailure(nameof(paper.TotalMarks),
                    $"Paper totals {actualMarks} marks but the assessment pattern requires {expectedMarks}."));
            }

            // 3. Every MCQ question must have at least one correct option.
            foreach (var q in paper.Questions.Where(q => q.QuestionType is "SINGLE_CHOICE" or "MULTI_CHOICE"))
            {
                if (!q.Options.Any(o => o.IsCorrect))
                {
                    failures.Add(new ValidationFailure(nameof(VacancyQuestion.Options),
                        $"Question #{q.QuestionNumber} ({q.QuestionType}) has no option marked correct."));
                }
            }

            // 4. Coding/SQL/Subjective questions must have non-empty question text.
            foreach (var q in paper.Questions.Where(q => q.QuestionType is "CODING" or "SQL" or "SUBJECTIVE"))
            {
                if (string.IsNullOrWhiteSpace(q.QuestionText))
                {
                    failures.Add(new ValidationFailure(nameof(VacancyQuestion.QuestionText),
                        $"Question #{q.QuestionNumber} ({q.QuestionType}) has empty question text."));
                }
            }

            if (failures.Count != 0)
            {
                throw new ValidationException(failures);
            }

            paper.Status = "Published";
            paper.PublishedAt = DateTime.UtcNow;
            paper.PublishedById = request.PublishedByUserId;

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                UserId = request.PublishedByUserId,
                Action = "PublishQuestionPaper",
                EntityName = nameof(VacancyQuestionPaper),
                EntityId = paper.Id.ToString(),
            });

            await db.SaveChangesAsync(cancellationToken);

            return new QuestionPaperDto(paper.Id, paper.VacancyId, paper.PaperCode, paper.Title, paper.PaperVersion,
                paper.TotalQuestions, paper.TotalMarks, paper.DurationMinutes, paper.PassingPercentage, paper.Status,
                paper.PublishedAt, []);
        }
    }
}
