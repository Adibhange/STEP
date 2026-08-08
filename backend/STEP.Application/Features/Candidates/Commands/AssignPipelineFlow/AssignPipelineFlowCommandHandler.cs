using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Vacancy;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;
using CandidatePipelineProgressEntity = STEP.Domain.Entities.Candidate.CandidatePipelineProgress;

namespace STEP.Application.Features.Candidates.Commands.AssignPipelineFlow
{
    public class AssignPipelineFlowCommandHandler(IApplicationDbContext db, IPasswordHasher hasher)
        : IRequestHandler<AssignPipelineFlowCommand, AssignPipelineFlowResultDto>
    {
        public async Task<AssignPipelineFlowResultDto> Handle(AssignPipelineFlowCommand request, CancellationToken cancellationToken)
        {
            var candidate = await db.Candidates
                .Include(c => c.Vacancy)
                .Include(c => c.PipelineProgressHistory)
                .FirstOrDefaultAsync(c => c.Id == request.CandidateId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateEntity), request.CandidateId);

            if (candidate.PipelineProgressHistory.Count != 0)
            {
                throw new ValidationException([
                    new FluentValidation.Results.ValidationFailure(nameof(candidate.CurrentPipelineProgressId),
                        "This candidate already has a pipeline flow assigned.")
                ]);
            }

            var flow = await db.VacancyPipelineFlows
                .Include(f => f.Rounds)
                .FirstOrDefaultAsync(f => f.Id == request.VacancyPipelineFlowId && f.VacancyId == candidate.VacancyId, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyPipelineFlow), request.VacancyPipelineFlowId);

            if (flow.Rounds.Count == 0)
            {
                throw new ValidationException([
                    new FluentValidation.Results.ValidationFailure(nameof(flow.Rounds), "This pipeline flow has no rounds defined.")
                ]);
            }

            CandidatePipelineProgressEntity? firstRoundProgress = null;
            foreach (var round in flow.Rounds.OrderBy(r => r.RoundOrder))
            {
                var progress = new CandidatePipelineProgressEntity
                {
                    CandidateId = candidate.Id,
                    VacancyPipelineFlowRoundId = round.Id,
                    RoundNumber = round.RoundOrder,
                    RoundTitle = round.Name,
                    RoundType = PipelineRoundClassification.Classify(round.RoundType),
                    Status = "Assigned",
                };

                candidate.PipelineProgressHistory.Add(progress);
                firstRoundProgress ??= progress;
            }

            // Direct-hire candidates are only ever added to STEP after HR has already screened
            // them in person — Round 1 ("HR Screening") is a formality by the time they're in the
            // system, not something that still needs evaluating. Walk-in Round 1 (Aptitude) has no
            // such shortcut: it auto-passes nobody.
            var orderedRounds = candidate.PipelineProgressHistory.OrderBy(p => p.RoundNumber).ToList();
            var activeRoundProgress = firstRoundProgress;
            if (candidate.Vacancy.DriveType == "Direct" && orderedRounds.Count > 0)
            {
                var hrScreeningRound = orderedRounds[0];
                hrScreeningRound.Status = "Passed";
                hrScreeningRound.EvaluatedAt = DateTime.UtcNow;
                hrScreeningRound.CompletedAt = DateTime.UtcNow;
                hrScreeningRound.Remarks = "Auto-passed — direct-hire candidates are HR-screened before being registered in STEP.";
                activeRoundProgress = orderedRounds.Count > 1 ? orderedRounds[1] : hrScreeningRound;
            }

            await db.SaveChangesAsync(cancellationToken); // assigns Ids to the new progress rows

            candidate.CurrentPipelineProgressId = activeRoundProgress!.Id;
            candidate.CurrentStage = activeRoundProgress.RoundTitle;
            candidate.Status = "In-Progress";

            string? examPasscode = null;
            if (activeRoundProgress.RoundType == "Assessment")
            {
                examPasscode = Convert.ToHexString(RandomNumberGenerator.GetBytes(4)); // 8-char alphanumeric-ish passcode
                candidate.ExamPasscodeHash = hasher.Hash(examPasscode);
            }

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                Action = "AssignPipelineFlow",
                EntityName = nameof(CandidateEntity),
                EntityId = candidate.Id.ToString(),
            });

            await db.SaveChangesAsync(cancellationToken);

            var progressDtos = candidate.PipelineProgressHistory
                .OrderBy(p => p.RoundNumber)
                .Select(p => new PipelineProgressDto(p.Id, p.RoundNumber, p.RoundTitle, p.RoundType, p.Status, p.ScoreObtained, p.StartedAt, p.CompletedAt, null, null))
                .ToList();

            var candidateDto = new CandidateDto(
                candidate.Id, candidate.CandidateCode, candidate.FirstName, candidate.LastName, candidate.Email, candidate.Phone,
                candidate.VacancyId, candidate.Vacancy.Title, candidate.CurrentStage, candidate.Status, candidate.RegistrationChannel,
                candidate.ReferralEmployeeName, candidate.TotalExperienceYears, candidate.CurrentCTC, candidate.ExpectedCTC,
                candidate.NoticePeriodDays, candidate.CurrentLocation, candidate.HighestQualification, candidate.CreatedAt,
                progressDtos, []);

            return new AssignPipelineFlowResultDto(candidateDto, examPasscode);
        }
    }
}
