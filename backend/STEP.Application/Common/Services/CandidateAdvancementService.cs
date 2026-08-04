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
            if (!passed)
            {
                candidate.Status = "Rejected";
                return Task.FromResult(new CandidateAdvancementResult(false, null, null, candidate.Status));
            }

            var nextRound = candidate.PipelineProgressHistory
                .FirstOrDefault(p => p.RoundNumber == completedProgress.RoundNumber + 1);

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
