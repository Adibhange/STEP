using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Services;
using STEP.Application.Features.Candidates.Common;
using STEP.Domain.Entities.Audit;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;
using CandidatePipelineProgressEntity = STEP.Domain.Entities.Candidate.CandidatePipelineProgress;

namespace STEP.Application.Features.Candidates.Commands.EvaluateCandidateStage
{
    public record EvaluateCandidateStageCommand(
        int CandidateId,
        int RoundNumber,
        bool Passed,
        string? Remarks,
        string? DirectorPin = null,
        bool IsRetake = false
    ) : IRequest<CandidateDto>;

    public class EvaluateCandidateStageCommandHandler(IApplicationDbContext db, ICandidateAdvancementService advancement, IPasswordHasher hasher)
        : IRequestHandler<EvaluateCandidateStageCommand, CandidateDto>
    {
        public async Task<CandidateDto> Handle(EvaluateCandidateStageCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.DirectorPin))
            {
                var activeDirectors = await db.Users
                    .Include(u => u.Role)
                    .Where(u => u.Role.Name == "Director" && u.IsActive && u.PinHash != null)
                    .ToListAsync(cancellationToken);

                var isPinValid = activeDirectors.Any(u => hasher.Verify(request.DirectorPin, u.PinHash!));

                if (!isPinValid)
                {
                    throw new ValidationException([new FluentValidation.Results.ValidationFailure("DirectorPin", "Invalid 4-digit Director security PIN.")]);
                }
            }

            var candidate = await db.Candidates
                .Include(c => c.Vacancy)
                .Include(c => c.PipelineProgressHistory)
                .FirstOrDefaultAsync(c => c.Id == request.CandidateId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateEntity), request.CandidateId);

            // If pipeline progress history doesn't exist yet, auto-populate rounds for candidate
            if (candidate.PipelineProgressHistory.Count == 0)
            {
                var flow = await db.VacancyPipelineFlows
                    .Include(f => f.Rounds)
                    .FirstOrDefaultAsync(f => f.VacancyId == candidate.VacancyId, cancellationToken);

                if (flow != null && flow.Rounds.Count > 0)
                {
                    foreach (var round in flow.Rounds.OrderBy(r => r.RoundOrder))
                    {
                        var p = new CandidatePipelineProgressEntity
                        {
                            CandidateId = candidate.Id,
                            VacancyPipelineFlowRoundId = round.Id,
                            RoundNumber = round.RoundOrder,
                            RoundTitle = round.Name,
                            RoundType = STEP.Application.Common.PipelineRoundClassification.Classify(round.RoundType),
                            Status = "Pending",
                        };
                        candidate.PipelineProgressHistory.Add(p);
                    }
                }
                else
                {
                    var fallbackRoundId = await db.VacancyPipelineFlowRounds
                        .Select(r => r.Id)
                        .FirstOrDefaultAsync(cancellationToken);

                    var isWalkIn = candidate.RegistrationChannel == "Walk-in" || candidate.QRCodeId != null;
                    var r1Name = isWalkIn ? "General Aptitude & Logical Test" : "HR Screening";
                    var r1Type = isWalkIn ? "Assessment" : "Interview";

                    var defaultRounds = new[]
                    {
                        (1, r1Name, r1Type),
                        (2, "Coding & Algorithm Challenge", "Assessment"),
                        (3, "Technical F2F & Live Coding", "Interview"),
                        (4, "Director Interview", "Interview"),
                        (5, "Offer Rollout", "Offer"),
                    };

                    foreach (var (rNum, rTitle, rType) in defaultRounds)
                    {
                        var p = new CandidatePipelineProgressEntity
                        {
                            CandidateId = candidate.Id,
                            VacancyPipelineFlowRoundId = fallbackRoundId,
                            RoundNumber = rNum,
                            RoundTitle = rTitle,
                            RoundType = rType,
                            Status = "Pending",
                        };
                        candidate.PipelineProgressHistory.Add(p);
                    }
                }

                await db.SaveChangesAsync(cancellationToken);
            }

            var progress = candidate.PipelineProgressHistory.FirstOrDefault(p => p.RoundNumber == request.RoundNumber);

            if (progress == null)
            {
                var flowRound = await db.VacancyPipelineFlowRounds
                    .Include(r => r.VacancyPipelineFlow)
                    .Where(r => r.VacancyPipelineFlow.VacancyId == candidate.VacancyId && r.RoundOrder == request.RoundNumber && !r.IsDeleted)
                    .FirstOrDefaultAsync(cancellationToken);

                var roundTitle = flowRound?.Name ?? (request.RoundNumber == 4 ? "Round 4: Director Final & Offer" : $"Round {request.RoundNumber}");
                var roundType = flowRound != null ? STEP.Application.Common.PipelineRoundClassification.Classify(flowRound.RoundType) : (request.RoundNumber == 4 ? "Director" : "Interview");

                var fallbackRoundId = await db.VacancyPipelineFlowRounds.Select(r => r.Id).FirstOrDefaultAsync(cancellationToken);

                progress = new CandidatePipelineProgressEntity
                {
                    CandidateId = candidate.Id,
                    VacancyPipelineFlowRoundId = flowRound?.Id ?? fallbackRoundId,
                    RoundNumber = request.RoundNumber,
                    RoundTitle = roundTitle,
                    RoundType = roundType,
                    Status = "Pending"
                };
                candidate.PipelineProgressHistory.Add(progress);
                await db.SaveChangesAsync(cancellationToken);
            }

            if (request.IsRetake)
            {
                // Count completed attempts to enforce maximum 2 attempts limit
                var completedAttempts = await db.CandidateExamSessionsV2
                    .CountAsync(s => s.CandidateId == candidate.Id && s.CandidatePipelineProgressId == progress.Id
                        && (s.SessionStatus == "Submitted" || s.SessionStatus == "AutoSubmitted" || s.SessionStatus == "Evaluated"), cancellationToken);

                if (completedAttempts >= 2)
                {
                    throw new ValidationException([new FluentValidation.Results.ValidationFailure("RetakeLimit", "Candidate has already utilized the maximum limit of 2 attempts. No further retakes can be granted.")]);
                }

                var prevScore = progress.ScoreObtained;
                progress.Status = "Pending";
                progress.ScoreObtained = null;
                progress.CompletedAt = null;
                progress.EvaluatedAt = null;
                progress.StartedAt = null;
                progress.TestPasscode = "1234";
                progress.Remarks = $"Retake authorized (Attempt {completedAttempts + 1} of 2). Previous attempt score: {prevScore ?? 0:0.##}%.";

                // Unblock candidate from Rejected/Eliminated
                candidate.Status = "Applied";
                candidate.CurrentStage = progress.RoundTitle;
                candidate.CurrentPipelineProgress = progress;

                db.AuditLogs.Add(new AuditLog
                {
                    CorrelationId = Guid.NewGuid(),
                    Action = "AuthorizeRetake",
                    EntityName = nameof(CandidateEntity),
                    EntityId = candidate.CandidateCode,
                });

                await db.SaveChangesAsync(cancellationToken);

                var retakeHistoryDtos = candidate.PipelineProgressHistory
                    .OrderBy(p => p.RoundNumber)
                    .Select(p => new PipelineProgressDto(
                        p.Id, p.RoundNumber, p.RoundTitle, p.RoundType, p.Status,
                        p.ScoreObtained, p.StartedAt, p.CompletedAt, null, null))
                    .ToList();

                return new CandidateDto(
                    candidate.Id, candidate.CandidateCode, candidate.FirstName, candidate.LastName, candidate.Email, candidate.Phone,
                    candidate.VacancyId, candidate.Vacancy?.Title ?? "N/A", candidate.CurrentStage, candidate.Status, candidate.RegistrationChannel,
                    candidate.ReferralEmployeeName, candidate.TotalExperienceYears, candidate.CurrentCTC, candidate.ExpectedCTC,
                    candidate.NoticePeriodDays, candidate.CurrentLocation, candidate.HighestQualification, candidate.CreatedAt,
                    retakeHistoryDtos, []);
            }

            progress.Status = request.Passed ? "Passed" : "Failed";
            progress.EvaluatedAt = DateTime.UtcNow;
            progress.CompletedAt = DateTime.UtcNow;
            progress.Remarks = request.Remarks ?? (request.Passed ? "Stage evaluated and passed." : "Stage evaluated — failed.");

            await advancement.AdvanceOrResolveAsync(candidate, progress, request.Passed, cancellationToken);

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                Action = "EvaluateCandidateStage",
                EntityName = nameof(CandidateEntity),
                EntityId = candidate.CandidateCode,
            });

            await db.SaveChangesAsync(cancellationToken);

            var historyDtos = candidate.PipelineProgressHistory
                .OrderBy(p => p.RoundNumber)
                .Select(p => new PipelineProgressDto(
                    p.Id, p.RoundNumber, p.RoundTitle, p.RoundType, p.Status,
                    p.ScoreObtained, p.StartedAt, p.CompletedAt, null, null))
                .ToList();

            return new CandidateDto(
                candidate.Id, candidate.CandidateCode, candidate.FirstName, candidate.LastName, candidate.Email, candidate.Phone,
                candidate.VacancyId, candidate.Vacancy?.Title ?? "N/A", candidate.CurrentStage, candidate.Status, candidate.RegistrationChannel,
                candidate.ReferralEmployeeName, candidate.TotalExperienceYears, candidate.CurrentCTC, candidate.ExpectedCTC,
                candidate.NoticePeriodDays, candidate.CurrentLocation, candidate.HighestQualification, candidate.CreatedAt,
                historyDtos, []);
        }
    }
}
