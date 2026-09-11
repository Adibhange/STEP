using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Candidate;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.Candidates.Commands.UpdateRoundInterviewerFeedback
{
    public record UpdateRoundInterviewerFeedbackCommand(
        int CandidateId,
        int RoundNumber,
        int? InterviewerUserId,
        string? Feedback
    ) : IRequest<CandidateDto>;

    public class UpdateRoundInterviewerFeedbackCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        IMediator mediator
    ) : IRequestHandler<UpdateRoundInterviewerFeedbackCommand, CandidateDto>
    {
        public async Task<CandidateDto> Handle(UpdateRoundInterviewerFeedbackCommand request, CancellationToken cancellationToken)
        {
            if (currentUser.UserId == null)
            {
                throw new AuthenticationFailedException("User is not authenticated.");
            }

            // Authenticate and load caller details dynamically
            var caller = await db.Users
                .Include(u => u.Role)
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == currentUser.UserId.Value, cancellationToken);

            if (caller == null || !caller.IsActive)
            {
                throw new ForbiddenAccessException("Your account is not active or could not be found.");
            }

            var roleName = caller.Role?.Name?.Trim() ?? string.Empty;
            var deptCode = caller.Department?.Code?.Trim() ?? string.Empty;
            var deptName = caller.Department?.Name?.Trim() ?? string.Empty;

            var isDirectorOrAdmin = roleName.Equals("Director", StringComparison.OrdinalIgnoreCase)
                || roleName.Equals("Administrator", StringComparison.OrdinalIgnoreCase)
                || roleName.Equals("Admin", StringComparison.OrdinalIgnoreCase);

            var isHrDepartment = deptCode.Equals("HR", StringComparison.OrdinalIgnoreCase)
                || deptName.IndexOf("HR", StringComparison.OrdinalIgnoreCase) >= 0
                || deptName.IndexOf("Human Resources", StringComparison.OrdinalIgnoreCase) >= 0
                || roleName.Equals("HR", StringComparison.OrdinalIgnoreCase);

            if (!isDirectorOrAdmin && !isHrDepartment)
            {
                throw new ForbiddenAccessException("Only HR department users and Directors are authorized to modify interviewer and feedback.");
            }

            var candidate = await db.Candidates
                .Include(c => c.PipelineProgressHistory)
                .FirstOrDefaultAsync(c => c.Id == request.CandidateId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateEntity), request.CandidateId);

            // Validate whether the target round is locked
            if (request.RoundNumber > 1)
            {
                var failedPrior = candidate.PipelineProgressHistory
                    .Where(p => p.RoundNumber < request.RoundNumber && !p.IsDeleted)
                    .OrderBy(p => p.RoundNumber)
                    .FirstOrDefault(p =>
                        (p.Status != null && (p.Status.Equals("Failed", StringComparison.OrdinalIgnoreCase) || p.Status.Equals("Rejected", StringComparison.OrdinalIgnoreCase)))
                        || (p.Remarks != null && (p.Remarks.IndexOf("did not meet", StringComparison.OrdinalIgnoreCase) >= 0 || p.Remarks.IndexOf("failed", StringComparison.OrdinalIgnoreCase) >= 0)));

                if (failedPrior != null)
                {
                    throw new ForbiddenAccessException($"Round {request.RoundNumber} is locked because candidate failed Round {failedPrior.RoundNumber}. Remarks can only be edited on unlocked rounds.");
                }
            }

            var progress = candidate.PipelineProgressHistory.FirstOrDefault(p => p.RoundNumber == request.RoundNumber);
            if (progress == null)
            {
                var flowRound = await db.VacancyPipelineFlowRounds
                    .FirstOrDefaultAsync(r => r.VacancyPipelineFlow.VacancyId == candidate.VacancyId && r.RoundOrder == request.RoundNumber && !r.IsDeleted, cancellationToken)
                    ?? await db.VacancyPipelineFlowRounds
                    .FirstOrDefaultAsync(r => r.RoundOrder == request.RoundNumber && !r.IsDeleted, cancellationToken);

                var roundId = flowRound?.Id ?? await db.VacancyPipelineFlowRounds.Select(r => r.Id).FirstOrDefaultAsync(cancellationToken);

                progress = new CandidatePipelineProgress
                {
                    CandidateId = candidate.Id,
                    VacancyPipelineFlowRoundId = roundId,
                    RoundNumber = request.RoundNumber,
                    RoundTitle = flowRound?.Name ?? $"Round {request.RoundNumber}",
                    RoundType = flowRound?.RoundType ?? (request.RoundNumber == 1 ? "Interview" : "Assessment"),
                    Status = "Assigned",
                };
                candidate.PipelineProgressHistory.Add(progress);
                await db.SaveChangesAsync(cancellationToken);
            }

            // Capture previous interviewer name for audit log
            string previousInterviewer = "Unassigned";
            if (progress.EvaluatorId.HasValue)
            {
                var prevUser = await db.Users.FirstOrDefaultAsync(u => u.Id == progress.EvaluatorId.Value, cancellationToken);
                if (prevUser != null)
                {
                    previousInterviewer = $"{prevUser.FirstName} {prevUser.LastName}".Trim();
                }
            }
            else
            {
                var interviewPrev = await db.Interviews
                    .Include(i => i.InterviewerUser)
                    .FirstOrDefaultAsync(i => i.CandidatePipelineProgressId == progress.Id && !i.IsDeleted, cancellationToken);
                if (interviewPrev?.InterviewerUser != null)
                {
                    previousInterviewer = $"{interviewPrev.InterviewerUser.FirstName} {interviewPrev.InterviewerUser.LastName}".Trim();
                }
            }

            string previousFeedback = progress.Remarks ?? string.Empty;
            string? newInterviewerName = null;
            string? newFeedback = null;

            // Update Interviewer if provided
            if (request.InterviewerUserId.HasValue)
            {
                var newInterviewerUser = await db.Users
                    .Include(u => u.Role)
                    .Include(u => u.Department)
                    .FirstOrDefaultAsync(u => u.Id == request.InterviewerUserId.Value, cancellationToken)
                    ?? throw new NotFoundException(nameof(STEP.Domain.Entities.Identity.User), request.InterviewerUserId.Value);

                if (!newInterviewerUser.IsActive)
                {
                    throw new ValidationException([new FluentValidation.Results.ValidationFailure("InterviewerUserId", "Selected interviewer account is inactive.")]);
                }

                if (request.RoundNumber == 1)
                {
                    var targetDeptCode = newInterviewerUser.Department?.Code?.Trim() ?? string.Empty;
                    var targetDeptName = newInterviewerUser.Department?.Name?.Trim() ?? string.Empty;
                    var targetRole = newInterviewerUser.Role?.Name?.Trim() ?? string.Empty;

                    var isTargetHr = targetDeptCode.Equals("HR", StringComparison.OrdinalIgnoreCase)
                        || targetDeptName.IndexOf("HR", StringComparison.OrdinalIgnoreCase) >= 0
                        || targetDeptName.IndexOf("Human Resources", StringComparison.OrdinalIgnoreCase) >= 0
                        || targetRole.Equals("HR", StringComparison.OrdinalIgnoreCase);

                    if (!isTargetHr)
                    {
                        throw new ValidationException([new FluentValidation.Results.ValidationFailure("InterviewerUserId", "Round 1 interviewer must be a member of the HR department.")]);
                    }
                }

                progress.EvaluatorId = newInterviewerUser.Id;
                newInterviewerName = $"{newInterviewerUser.FirstName} {newInterviewerUser.LastName}".Trim();

                var interview = await db.Interviews
                    .FirstOrDefaultAsync(i => i.CandidatePipelineProgressId == progress.Id && !i.IsDeleted, cancellationToken);
                if (interview != null)
                {
                    interview.InterviewerUserId = newInterviewerUser.Id;
                }
            }

            // Update Feedback if provided
            if (request.Feedback != null)
            {
                var trimmedFeedback = request.Feedback.Trim();
                if (trimmedFeedback.Length > 4000)
                {
                    throw new ValidationException([new FluentValidation.Results.ValidationFailure("Feedback", "Feedback remarks cannot exceed 4000 characters.")]);
                }

                progress.Remarks = trimmedFeedback;
                progress.EvaluatedAt = DateTime.UtcNow;
                newFeedback = trimmedFeedback;
            }

            // Record audit trail in audit.AuditLogs
            var auditChanges = new
            {
                candidateId = candidate.Id,
                candidateCode = candidate.CandidateCode,
                roundNumber = request.RoundNumber,
                roundId = progress.Id,
                roundTitle = progress.RoundTitle,
                previousInterviewer,
                newInterviewer = newInterviewerName ?? previousInterviewer,
                previousFeedback,
                newFeedback = newFeedback ?? previousFeedback,
                changedByUserId = caller.Id,
                changedByUserName = $"{caller.FirstName} {caller.LastName}".Trim(),
                changedByUserRole = caller.Role?.Name,
                changedByUserDepartment = caller.Department?.Name,
                changedAt = DateTime.UtcNow
            };

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                UserId = caller.Id,
                Action = "UpdateRoundInterviewerFeedback",
                EntityName = nameof(CandidatePipelineProgress),
                EntityId = progress.Id.ToString(),
                Changes = JsonSerializer.Serialize(auditChanges)
            });

            await db.SaveChangesAsync(cancellationToken);

            return await mediator.Send(new Queries.GetCandidateById.GetCandidateByIdQuery(candidate.Id), cancellationToken);
        }
    }
}
