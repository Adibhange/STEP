using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Services;
using STEP.Application.Features.Interviews.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Interview;
using STEP.Domain.Entities.Notification;

namespace STEP.Application.Features.Interviews.Commands.PublishInterviewResult
{
    /// <summary>Mirrors PublishAssessmentResultCommand's shape but for Interview-classified rounds — no auto-eval needed, the caller (HR) supplies the Pass/Fail decision directly.</summary>
    public class PublishInterviewResultCommandHandler(IApplicationDbContext db, ICandidateAdvancementService advancement)
        : IRequestHandler<PublishInterviewResultCommand, InterviewPublishResultDto>
    {
        public async Task<InterviewPublishResultDto> Handle(PublishInterviewResultCommand request, CancellationToken cancellationToken)
        {
            var interview = await db.Interviews
                .Include(i => i.CandidatePipelineProgress)
                .FirstOrDefaultAsync(i => i.Id == request.InterviewId, cancellationToken)
                ?? throw new NotFoundException(nameof(Interview), request.InterviewId);

            if (interview.Status == "Completed")
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(interview.Status),
                    "This interview's result has already been published.")]);
            }

            var progress = interview.CandidatePipelineProgress;

            var candidate = await db.Candidates
                .Include(c => c.PipelineProgressHistory)
                .FirstAsync(c => c.Id == progress.CandidateId, cancellationToken);

            interview.Status = "Completed";
            progress.Status = request.Passed ? "Passed" : "Failed";
            progress.CompletedAt = DateTime.UtcNow;
            progress.EvaluatedAt = DateTime.UtcNow;
            progress.EvaluatorId = request.PublishedByUserId;
            progress.Remarks = request.Remarks;

            var advancementResult = await advancement.AdvanceOrResolveAsync(candidate, progress, request.Passed, cancellationToken);

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                UserId = request.PublishedByUserId,
                Action = "PublishInterviewResult",
                EntityName = nameof(Interview),
                EntityId = interview.Id.ToString(),
            });

            db.OutboxMessages.Add(new OutboxMessage
            {
                EventType = "InterviewEvaluatedEvent",
                Payload = System.Text.Json.JsonSerializer.Serialize(new
                {
                    InterviewId = interview.Id,
                    CandidateId = candidate.Id,
                    request.Passed,
                    advancementResult.Advanced,
                    advancementResult.CandidateStatus,
                }),
            });

            await db.SaveChangesAsync(cancellationToken);

            return new InterviewPublishResultDto(
                interview.Id, request.Passed, advancementResult.Advanced, advancementResult.NextRoundTitle,
                advancementResult.NextRoundExamPasscode, advancementResult.CandidateStatus);
        }
    }
}
