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
            // 1. Try V2 Session
            var sessionV2 = await db.CandidateExamSessionsV2
                .Include(s => s.Answers)
                .Include(s => s.CandidatePipelineProgress)
                .FirstOrDefaultAsync(s => s.Id == request.CandidateExamSessionId, cancellationToken);

            if (sessionV2 != null)
            {
                // 1. Verify session submission.
                if (sessionV2.SessionStatus != "Submitted" && sessionV2.EvaluationStatus != "PartiallyEvaluated")
                {
                    throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(sessionV2.SessionStatus),
                        $"Only a Submitted session can be published (current status: '{sessionV2.SessionStatus}').")]);
                }

                // 2. Verify full manual evaluation (no answer left Pending).
                var unevaluated = sessionV2.Answers.Count(a => a.EvaluationStatus is "Pending");
                if (unevaluated != 0)
                {
                    throw new ValidationException([new FluentValidation.Results.ValidationFailure("Answers",
                        $"{unevaluated} answer(s) still need manual evaluation before this result can be published.")]);
                }

                var progress = sessionV2.CandidatePipelineProgress
                    ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(sessionV2.CandidatePipelineProgressId),
                        "This session is not linked to a pipeline progress row.")]);

                var candidate = await db.Candidates
                    .Include(c => c.PipelineProgressHistory)
                    .FirstAsync(c => c.Id == sessionV2.CandidateId, cancellationToken);

                // 3. Calculate final score, percentage, result status.
                sessionV2.TotalScore = sessionV2.Answers.Sum(a => a.MarksObtained);
                sessionV2.Percentage = sessionV2.TotalMarks > 0 ? Math.Round(sessionV2.TotalScore / sessionV2.TotalMarks * 100, 2) : 0;
                sessionV2.ResultStatus = sessionV2.Percentage >= sessionV2.PassingPercentage ? "Pass" : "Fail";

                // 4. Publish timestamps.
                sessionV2.EvaluationStatus = "Published";
                sessionV2.SessionStatus = "Evaluated";
                sessionV2.EvaluatedAt = DateTimeOffset.UtcNow;
                sessionV2.EvaluatorUserId = request.PublishedByUserId;

                // 5. Lock every answer.
                foreach (var answer in sessionV2.Answers)
                {
                    answer.EvaluationLocked = true;
                    answer.EvaluationStatus = "Published";
                }

                // 6. Update the pipeline progress row.
                var passed = sessionV2.ResultStatus == "Pass";
                progress.Status = passed ? "Passed" : "Failed";
                progress.ScoreObtained = sessionV2.Percentage;
                progress.CompletedAt = DateTime.UtcNow;
                progress.EvaluatedAt = DateTime.UtcNow;
                progress.EvaluatorId = request.PublishedByUserId;
                progress.Remarks = $"Assessment Score: {sessionV2.TotalScore}/{sessionV2.TotalMarks} ({sessionV2.Percentage}% — {sessionV2.ResultStatus})" +
                    (!string.IsNullOrWhiteSpace(request.Remarks) ? $" • {request.Remarks}" : "");

                // 7. Auto-advance if passed.
                var advancementResult = await advancement.AdvanceOrResolveAsync(candidate, progress, passed, cancellationToken);

                db.AuditLogs.Add(new AuditLog
                {
                    CorrelationId = Guid.NewGuid(),
                    UserId = request.PublishedByUserId,
                    Action = "PublishAssessmentResult",
                    EntityName = nameof(CandidateExamSessionV2),
                    EntityId = sessionV2.Id.ToString(),
                });

                await db.SaveChangesAsync(cancellationToken);

                return new PublishResultDto(
                    sessionV2.Id, sessionV2.ResultStatus, sessionV2.TotalScore, sessionV2.TotalMarks, sessionV2.Percentage,
                    advancementResult.Advanced, advancementResult.NextRoundTitle, advancementResult.NextRoundExamPasscode, advancementResult.CandidateStatus);
            }

            // 2. Fallback to V1 Session
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
            var unevaluatedV1 = session.Answers.Count(a => a.EvaluationStatus is "Pending" or "InReview");
            if (unevaluatedV1 != 0)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("Answers",
                    $"{unevaluatedV1} answer(s) still need manual evaluation before this result can be published.")]);
            }

            var progressV1 = session.CandidatePipelineProgress
                ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(session.CandidatePipelineProgressId),
                    "This session is not linked to a pipeline progress row.")]);

            var candidateV1 = await db.Candidates
                .Include(c => c.PipelineProgressHistory)
                .FirstAsync(c => c.Id == progressV1.CandidateId, cancellationToken);

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
            var passedV1 = session.ResultStatus == "Pass";
            progressV1.Status = passedV1 ? "Passed" : "Failed";
            progressV1.ScoreObtained = session.Percentage;
            progressV1.CompletedAt = DateTime.UtcNow;
            progressV1.EvaluatedAt = DateTime.UtcNow;
            progressV1.EvaluatorId = request.PublishedByUserId;
            progressV1.Remarks = request.Remarks;

            // 7. Auto-advance if passed (or resolve to Rejected/Offered) — shared with Phase 5's
            // PublishInterviewResultCommand so both round types advance identically.
            var advancementResultV1 = await advancement.AdvanceOrResolveAsync(candidateV1, progressV1, passedV1, cancellationToken);

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
                    CandidateId = candidateV1.Id,
                    session.ResultStatus,
                    session.Percentage,
                    advancementResultV1.Advanced,
                    advancementResultV1.CandidateStatus,
                }),
            });

            await db.SaveChangesAsync(cancellationToken);

            return new PublishResultDto(
                session.Id, session.ResultStatus, session.TotalScore, session.TotalMarks, session.Percentage,
                advancementResultV1.Advanced, advancementResultV1.NextRoundTitle, advancementResultV1.NextRoundExamPasscode, advancementResultV1.CandidateStatus);
        }
    }
}
