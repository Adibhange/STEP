using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Services;
using STEP.Application.Features.Exams.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Exam;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.Exams.Commands.PublishAssessmentResult
{
    /// <summary>
    /// Atomic result publish transaction per the blueprint's checklist. Everything below runs
    /// against entities loaded into one DbContext and is committed in a single SaveChangesAsync
    /// call — one transaction.
    /// </summary>
    public class PublishAssessmentResultCommandHandler(IApplicationDbContext db, ICandidateAdvancementService advancement)
        : IRequestHandler<PublishAssessmentResultCommand, PublishResultDto>
    {
        public async Task<PublishResultDto> Handle(PublishAssessmentResultCommand request, CancellationToken cancellationToken)
        {
            var session = await db.CandidateExamSessions
                .Include(s => s.Answers)
                .Include(s => s.CandidatePipelineProgress)
                .FirstOrDefaultAsync(s => s.Id == request.CandidateExamSessionId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateExamSession), request.CandidateExamSessionId);

            // 1. Verify session submission.
            if (session.SessionStatus != "Submitted")
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(session.SessionStatus),
                    $"Only a Submitted session can be published (current status: '{session.SessionStatus}').")]);
            }

            // 2. Verify full manual evaluation (no answer left Pending/InReview).
            var unevaluated = session.Answers.Count(a => a.EvaluationStatus is "Pending" or "InReview");
            if (unevaluated != 0)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("Answers",
                    $"{unevaluated} answer(s) still need manual evaluation before this result can be published.")]);
            }

            var progress = session.CandidatePipelineProgress
                ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(session.CandidatePipelineProgressId),
                    "This session is not linked to a pipeline progress row.")]);

            var candidate = await db.Candidates
                .Include(c => c.PipelineProgressHistory)
                .FirstAsync(c => c.Id == progress.CandidateId, cancellationToken);

            // 3. Calculate final score, percentage, result status.
            session.TotalScore = session.Answers.Sum(a => a.MarksObtained);
            session.Percentage = session.TotalMarks > 0 ? Math.Round(session.TotalScore / session.TotalMarks * 100, 2) : 0;
            session.ResultStatus = session.Percentage >= session.FrozenPassingPercentage ? "Pass" : "Fail";

            // 4. Publish + evaluated timestamp. SessionStatus moves to Evaluated so a repeat publish
            // attempt is rejected by the check at the top of this handler.
            session.EvaluationStatus = "Published";
            session.SessionStatus = "Evaluated";
            session.EvaluatedAt = DateTime.UtcNow;
            session.EvaluatorId = request.PublishedByUserId;

            // 5. Lock every answer.
            foreach (var answer in session.Answers)
            {
                answer.EvaluationLocked = true;
                answer.EvaluationStatus = "Published";
            }

            // 6. Update the pipeline progress row.
            var passed = session.ResultStatus == "Pass";
            progress.Status = passed ? "Passed" : "Failed";
            progress.ScoreObtained = session.Percentage;
            progress.CompletedAt = DateTime.UtcNow;
            progress.EvaluatedAt = DateTime.UtcNow;
            progress.EvaluatorId = request.PublishedByUserId;
            progress.Remarks = request.Remarks;

            // 7. Auto-advance if passed (or resolve to Rejected/Offered) — shared with Phase 5's
            // PublishInterviewResultCommand so both round types advance identically.
            var advancementResult = await advancement.AdvanceOrResolveAsync(candidate, progress, passed, cancellationToken);

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                UserId = request.PublishedByUserId,
                Action = "PublishAssessmentResult",
                EntityName = nameof(CandidateExamSession),
                EntityId = session.Id.ToString(),
            });

            // Step 8: dispatch AssessmentEvaluatedEvent to OutboxMessages (Phase 5).
            db.OutboxMessages.Add(new STEP.Domain.Entities.Notification.OutboxMessage
            {
                EventType = "AssessmentEvaluatedEvent",
                Payload = System.Text.Json.JsonSerializer.Serialize(new
                {
                    CandidateExamSessionId = session.Id,
                    CandidateId = candidate.Id,
                    session.ResultStatus,
                    session.Percentage,
                    advancementResult.Advanced,
                    advancementResult.CandidateStatus,
                }),
            });

            await db.SaveChangesAsync(cancellationToken);

            return new PublishResultDto(
                session.Id, session.ResultStatus, session.TotalScore, session.TotalMarks, session.Percentage,
                advancementResult.Advanced, advancementResult.NextRoundTitle, advancementResult.NextRoundExamPasscode, advancementResult.CandidateStatus);
        }
    }
}
