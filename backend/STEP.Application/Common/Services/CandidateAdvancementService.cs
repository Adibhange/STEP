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
                // Any stage failure = immediate candidate rejection
                candidate.Status = "Rejected";
                candidate.CurrentStage = $"{completedProgress.RoundTitle} (Failed)";
                return Task.FromResult(new CandidateAdvancementResult(false, null, null, candidate.Status));
            }

            // passed == true from here on.
            if (nextRound == null)
            {
                candidate.Status = "Hired";
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
