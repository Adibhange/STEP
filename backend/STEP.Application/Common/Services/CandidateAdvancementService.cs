using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using STEP.Application.Common.Interfaces;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;
using CandidatePipelineProgressEntity = STEP.Domain.Entities.Candidate.CandidatePipelineProgress;

namespace STEP.Application.Common.Services
{
    /// <summary>Implemented directly in Application — no external I/O beyond IPasswordHasher, which is already an Application-layer abstraction.</summary>
    public class CandidateAdvancementService(IPasswordHasher hasher) : ICandidateAdvancementService
    {
        public Task<CandidateAdvancementResult> AdvanceOrResolveAsync(
            CandidateEntity candidate, CandidatePipelineProgressEntity completedProgress, bool passed, CancellationToken cancellationToken)
        {
            var rounds = candidate.PipelineProgressHistory.OrderBy(p => p.RoundNumber).ToList();
            var nextRound = rounds.FirstOrDefault(p => p.RoundNumber == completedProgress.RoundNumber + 1);

            if (!passed)
            {
                // Round 1 (Paper Aptitude) failure = immediate pipeline rejection
                if (completedProgress.RoundNumber == 1)
                {
                    candidate.Status = "Rejected";
                    return Task.FromResult(new CandidateAdvancementResult(false, null, null, candidate.Status));
                }

                // Failing Round 2 (Coding Challenge) allows candidate to proceed to Round 3 (Technical F2F)
                if (completedProgress.RoundNumber == 2 && nextRound != null)
                {
                    candidate.CurrentPipelineProgressId = nextRound.Id;
                    candidate.CurrentStage = nextRound.RoundTitle;
                    candidate.Status = "In-Progress";
                    return Task.FromResult(new CandidateAdvancementResult(true, nextRound.RoundTitle, null, candidate.Status));
                }

                // For Round 3 or later: check if candidate has passed AT LEAST ONE technical round (Round 2 or 3)
                var round2 = rounds.FirstOrDefault(r => r.RoundNumber == 2);
                var round3 = rounds.FirstOrDefault(r => r.RoundNumber == 3);

                bool hasPassedTechnical = (round2 != null && round2.Status == "Passed") || (round3 != null && round3.Status == "Passed");

                if (!hasPassedTechnical)
                {
                    candidate.Status = "Rejected";
                    return Task.FromResult(new CandidateAdvancementResult(false, null, null, candidate.Status));
                }
            }

            if (nextRound == null)
            {
                candidate.Status = "Offered";
                return Task.FromResult(new CandidateAdvancementResult(false, null, null, candidate.Status));
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

            return Task.FromResult(new CandidateAdvancementResult(true, nextRound.RoundTitle, nextRoundPasscode, candidate.Status));
        }
    }
}
