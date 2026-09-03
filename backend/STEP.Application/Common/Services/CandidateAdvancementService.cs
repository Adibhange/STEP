using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;
using CandidatePipelineProgressEntity = STEP.Domain.Entities.Candidate.CandidatePipelineProgress;

namespace STEP.Application.Common.Services
{
    public class CandidateAdvancementService(IApplicationDbContext db, IPasswordHasher hasher) : ICandidateAdvancementService
    {
        public async Task<CandidateAdvancementResult> AdvanceOrResolveAsync(
            CandidateEntity candidate, CandidatePipelineProgressEntity completedProgress, bool passed, CancellationToken cancellationToken)
        {
            var rounds = candidate.PipelineProgressHistory.OrderBy(p => p.RoundNumber).ToList();
            var nextRound = rounds.FirstOrDefault(p => p.RoundNumber == completedProgress.RoundNumber + 1);

            if (!passed)
            {
                candidate.Status = "Rejected";
                candidate.CurrentStage = $"{completedProgress.RoundTitle} (Failed)";
                return new CandidateAdvancementResult(false, null, null, candidate.Status);
            }

            if (nextRound == null)
            {
                var defaultFlow = await db.VacancyPipelineFlows
                    .Include(f => f.Rounds)
                    .FirstOrDefaultAsync(f => f.VacancyId == candidate.VacancyId && f.IsDefault && !f.IsDeleted, cancellationToken)
                    ?? await db.VacancyPipelineFlows
                    .Include(f => f.Rounds)
                    .FirstOrDefaultAsync(f => f.VacancyId == candidate.VacancyId && !f.IsDeleted, cancellationToken);

                var targetRoundDef = defaultFlow?.Rounds?.FirstOrDefault(r => r.RoundOrder == completedProgress.RoundNumber + 1);

                if (targetRoundDef != null)
                {
                    nextRound = new CandidatePipelineProgressEntity
                    {
                        CandidateId = candidate.Id,
                        RoundNumber = targetRoundDef.RoundOrder,
                        RoundTitle = targetRoundDef.Name,
                        RoundType = targetRoundDef.RoundType ?? "Assessment",
                        Status = "Pending",
                        VacancyPipelineFlowRoundId = targetRoundDef.Id
                    };
                    db.CandidatePipelineProgresses.Add(nextRound);
                    candidate.PipelineProgressHistory.Add(nextRound);
                    await db.SaveChangesAsync(cancellationToken);
                }
            }

            if (nextRound == null)
            {
                candidate.Status = "Hired";
                return new CandidateAdvancementResult(false, null, null, candidate.Status);
            }

            candidate.CurrentPipelineProgressId = nextRound.Id;
            candidate.CurrentStage = nextRound.RoundTitle;
            candidate.Status = "In-Progress";

            string? nextRoundPasscode = null;
            if (nextRound.RoundType == "Assessment")
            {
                nextRoundPasscode = Convert.ToHexString(RandomNumberGenerator.GetBytes(4));
                candidate.ExamPasscodeHash = hasher.Hash(nextRoundPasscode);
            }

            return new CandidateAdvancementResult(true, nextRound.RoundTitle, nextRoundPasscode, candidate.Status);
        }
    }
}
