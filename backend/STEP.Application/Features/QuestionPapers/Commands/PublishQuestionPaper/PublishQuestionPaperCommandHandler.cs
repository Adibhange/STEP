using System;
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

            var failures = QuestionPaperValidation.Validate(paper);

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
