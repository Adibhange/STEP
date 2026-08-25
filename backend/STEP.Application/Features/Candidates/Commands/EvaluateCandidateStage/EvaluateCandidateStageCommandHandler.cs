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
        string? DirectorPin = null
    ) : IRequest<CandidateDto>;

    public class EvaluateCandidateStageCommandHandler(IApplicationDbContext db, ICandidateAdvancementService advancement, IPasswordHasher hasher)
        : IRequestHandler<EvaluateCandidateStageCommand, CandidateDto>
    {
        public async Task<CandidateDto> Handle(EvaluateCandidateStageCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.DirectorPin))
            {
                var isPinValid = await db.Users
                    .Include(u => u.Role)
                    .Where(u => u.Role.Name == "Director" && u.IsActive && u.PinHash != null)
                    .AnyAsync(u => hasher.Verify(request.DirectorPin, u.PinHash!), cancellationToken);

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

            var progress = candidate.PipelineProgressHistory.FirstOrDefault(p => p.RoundNumber == request.RoundNumber)
                ?? candidate.PipelineProgressHistory.OrderBy(p => p.RoundNumber).FirstOrDefault()
                ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.RoundNumber), "Round not found.")]);

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
