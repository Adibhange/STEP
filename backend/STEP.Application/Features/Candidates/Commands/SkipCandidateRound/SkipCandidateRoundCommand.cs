using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Services;
using STEP.Application.Features.Candidates.Common;
using STEP.Application.Features.Candidates.Queries.GetCandidateById;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Candidate;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.Candidates.Commands.SkipCandidateRound
{
    public record SkipCandidateRoundCommand(
        int CandidateId,
        int RoundNumber,
        string? Reason,
        int? TargetRoundNumber = null
    ) : IRequest<CandidateDto>;

    public class SkipCandidateRoundCommandHandler(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        ICandidateAdvancementService advancement,
        IPasswordHasher hasher,
        IMediator mediator
    ) : IRequestHandler<SkipCandidateRoundCommand, CandidateDto>
    {
        public async Task<CandidateDto> Handle(SkipCandidateRoundCommand request, CancellationToken cancellationToken)
        {
            if (currentUser.UserId == null)
            {
                throw new AuthenticationFailedException("User is not authenticated.");
            }

            // Authenticate and load caller details dynamically from the database
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

            // Authorization check:
            // 1. Current user's Department = HR
            // 2. OR Current user's Role = Director (or Administrator/Admin)
            var isDirectorOrAdmin = roleName.Equals("Director", StringComparison.OrdinalIgnoreCase)
                || roleName.Equals("Administrator", StringComparison.OrdinalIgnoreCase)
                || roleName.Equals("Admin", StringComparison.OrdinalIgnoreCase);

            var isHrDepartment = deptCode.Equals("HR", StringComparison.OrdinalIgnoreCase)
                || deptName.IndexOf("HR", StringComparison.OrdinalIgnoreCase) >= 0
                || deptName.IndexOf("Human Resources", StringComparison.OrdinalIgnoreCase) >= 0
                || roleName.Equals("HR", StringComparison.OrdinalIgnoreCase);

            if (!isDirectorOrAdmin && !isHrDepartment)
            {
                throw new ForbiddenAccessException("Only HR department users and Directors are authorized to skip rounds.");
            }

            var candidate = await db.Candidates
                .Include(c => c.Vacancy)
                .Include(c => c.PipelineProgressHistory)
                    .ThenInclude(p => p.SkippedBy)
                .FirstOrDefaultAsync(c => c.Id == request.CandidateId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateEntity), request.CandidateId);

            if (candidate.Status == "Hired")
            {
                throw new ValidationException([new ValidationFailure("Candidate", "Candidate has already been hired and completed the recruitment pipeline.")]);
            }

            // Check if this round is already passed
            var currentRoundProgress = candidate.PipelineProgressHistory.FirstOrDefault(p => p.RoundNumber == request.RoundNumber && !p.IsDeleted);
            if (currentRoundProgress != null &&
                (currentRoundProgress.Status.Equals("Passed", StringComparison.OrdinalIgnoreCase) ||
                 currentRoundProgress.Status.Equals("Cleared", StringComparison.OrdinalIgnoreCase)))
            {
                throw new ValidationException([new ValidationFailure("RoundNumber", $"Round {request.RoundNumber} is already passed and cannot be skipped.")]);
            }

            // Check if prior rounds lock this round
            if (request.RoundNumber > 1)
            {
                var uncompletedPrior = candidate.PipelineProgressHistory
                    .Where(p => p.RoundNumber < request.RoundNumber && !p.IsDeleted)
                    .OrderBy(p => p.RoundNumber)
                    .FirstOrDefault(p =>
                        !p.Status.Equals("Passed", StringComparison.OrdinalIgnoreCase) &&
                        !p.Status.Equals("Waived", StringComparison.OrdinalIgnoreCase) &&
                        !p.Status.Equals("Cleared", StringComparison.OrdinalIgnoreCase) &&
                        !p.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) &&
                        !(p.RoundTitle != null && p.RoundTitle.Contains("Auto-Passed", StringComparison.OrdinalIgnoreCase)));

                if (uncompletedPrior != null)
                {
                    throw new ValidationException([new ValidationFailure("RoundNumber",
                        $"Round {request.RoundNumber} is currently locked. Prior Round {uncompletedPrior.RoundNumber} ({uncompletedPrior.RoundTitle}) is {uncompletedPrior.Status}. Please evaluate or skip Round {uncompletedPrior.RoundNumber} first.")]);
                }
            }

            // Determine target destination round
            var targetRoundNumber = request.TargetRoundNumber ?? (request.RoundNumber + 1);
            if (targetRoundNumber <= request.RoundNumber)
            {
                throw new ValidationException([new ValidationFailure("TargetRoundNumber",
                    $"Target destination round ({targetRoundNumber}) must be greater than current round ({request.RoundNumber}).")]);
            }

            // Retrieve flow rounds for vacancy to ensure accurate round details
            var flowRounds = await db.VacancyPipelineFlowRounds
                .Include(r => r.VacancyPipelineFlow)
                .Where(r => r.VacancyPipelineFlow.VacancyId == candidate.VacancyId && !r.IsDeleted)
                .OrderBy(r => r.RoundOrder)
                .ToListAsync(cancellationToken);

            if (!flowRounds.Any())
            {
                flowRounds = await db.VacancyPipelineFlowRounds
                    .Where(r => !r.IsDeleted)
                    .OrderBy(r => r.RoundOrder)
                    .ToListAsync(cancellationToken);
            }

            var maxRoundOrder = flowRounds.Any()
                ? flowRounds.Max(r => r.RoundOrder)
                : (candidate.PipelineProgressHistory.Any() ? candidate.PipelineProgressHistory.Max(p => p.RoundNumber) : 4);

            var skipReason = !string.IsNullOrWhiteSpace(request.Reason)
                ? request.Reason.Trim()
                : (isDirectorOrAdmin ? "Round waived by Director." : "Round waived by HR department.");

            // Waive all rounds from request.RoundNumber up to Math.Min(targetRoundNumber - 1, maxRoundOrder)
            var waivedRoundNumbers = new List<int>();
            var roundsToWaiveEnd = Math.Min(targetRoundNumber - 1, maxRoundOrder);

            for (int rNum = request.RoundNumber; rNum <= roundsToWaiveEnd; rNum++)
            {
                var prog = candidate.PipelineProgressHistory
                    .Where(p => p.RoundNumber == rNum && !p.IsDeleted)
                    .OrderByDescending(p => p.Id)
                    .FirstOrDefault();

                if (prog == null)
                {
                    var flowRound = flowRounds.FirstOrDefault(f => f.RoundOrder == rNum);
                    var roundTitle = flowRound?.Name ?? (rNum == 4 ? "Round 4: Director Final & Offer" : $"Round {rNum}");
                    var roundType = flowRound != null ? PipelineRoundClassification.Classify(flowRound.RoundType) : (rNum == 4 ? "Director" : "Interview");
                    var fallbackRoundId = flowRound?.Id ?? flowRounds.Select(f => f.Id).FirstOrDefault();

                    prog = new CandidatePipelineProgress
                    {
                        CandidateId = candidate.Id,
                        VacancyPipelineFlowRoundId = fallbackRoundId,
                        RoundNumber = rNum,
                        RoundTitle = roundTitle,
                        RoundType = roundType,
                        Status = "Pending"
                    };
                    db.CandidatePipelineProgresses.Add(prog);
                    candidate.PipelineProgressHistory.Add(prog);
                }

                if (!prog.Status.Equals("Passed", StringComparison.OrdinalIgnoreCase) &&
                    !prog.Status.Equals("Cleared", StringComparison.OrdinalIgnoreCase))
                {
                    prog.Status = "Waived";
                    prog.SkippedById = caller.Id;
                    prog.SkippedBy = caller;
                    prog.SkipReason = skipReason;
                    prog.CompletedAt = DateTime.UtcNow;
                    prog.EvaluatedAt = DateTime.UtcNow;
                    prog.Remarks = targetRoundNumber > request.RoundNumber + 1
                        ? $"Round waived (Skipped from Round {request.RoundNumber} to Round {targetRoundNumber}): {skipReason}"
                        : $"Round waived: {skipReason}";
                    waivedRoundNumbers.Add(rNum);
                }
            }

            // Activate destination round or mark Hired if beyond pipeline
            if (targetRoundNumber <= maxRoundOrder)
            {
                var targetProg = candidate.PipelineProgressHistory
                    .Where(p => p.RoundNumber == targetRoundNumber && !p.IsDeleted)
                    .OrderByDescending(p => p.Id)
                    .FirstOrDefault();

                if (targetProg == null)
                {
                    var targetFlowRound = flowRounds.FirstOrDefault(f => f.RoundOrder == targetRoundNumber);
                    var targetTitle = targetFlowRound?.Name ?? (targetRoundNumber == 4 ? "Round 4: Director Final & Offer" : $"Round {targetRoundNumber}");
                    var targetType = targetFlowRound != null ? PipelineRoundClassification.Classify(targetFlowRound.RoundType) : (targetRoundNumber == 4 ? "Director" : "Interview");
                    var fallbackRoundId = targetFlowRound?.Id ?? flowRounds.Select(f => f.Id).FirstOrDefault();

                    targetProg = new CandidatePipelineProgress
                    {
                        CandidateId = candidate.Id,
                        VacancyPipelineFlowRoundId = fallbackRoundId,
                        RoundNumber = targetRoundNumber,
                        RoundTitle = targetTitle,
                        RoundType = targetType,
                        Status = "Pending"
                    };
                    db.CandidatePipelineProgresses.Add(targetProg);
                    candidate.PipelineProgressHistory.Add(targetProg);
                }
                else if (targetProg.Status.Equals("Assigned", StringComparison.OrdinalIgnoreCase))
                {
                    targetProg.Status = "Pending";
                }

                await db.SaveChangesAsync(cancellationToken);

                candidate.CurrentPipelineProgressId = targetProg.Id;
                candidate.CurrentStage = targetProg.RoundTitle;
                candidate.Status = "In-Progress";

                if (targetProg.RoundType == "Assessment")
                {
                    var nextPasscode = Convert.ToHexString(RandomNumberGenerator.GetBytes(4));
                    candidate.ExamPasscodeHash = hasher.Hash(nextPasscode);
                }
            }
            else
            {
                candidate.Status = "Hired";
                candidate.CurrentStage = "Hired";
            }

            // Audit record creation
            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                Action = "SkipCandidateRound",
                EntityName = nameof(CandidateEntity),
                EntityId = candidate.CandidateCode,
                UserId = caller.Id,
                Changes = JsonSerializer.Serialize(new
                {
                    candidateId = candidate.Id,
                    candidateCode = candidate.CandidateCode,
                    fromRoundNumber = request.RoundNumber,
                    toRoundNumber = targetRoundNumber,
                    waivedRounds = waivedRoundNumbers,
                    skippedByUserId = caller.Id,
                    skippedByName = $"{caller.FirstName} {caller.LastName}".Trim(),
                    skippedByRole = roleName,
                    skippedByDepartment = deptName,
                    reason = skipReason
                })
            });

            await db.SaveChangesAsync(cancellationToken);

            // Return updated candidate details
            return await mediator.Send(new GetCandidateByIdQuery(candidate.Id), cancellationToken);
        }
    }
}
