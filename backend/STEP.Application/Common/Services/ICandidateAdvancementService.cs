using System.Threading;
using System.Threading.Tasks;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;
using CandidatePipelineProgressEntity = STEP.Domain.Entities.Candidate.CandidatePipelineProgress;

namespace STEP.Application.Common.Services
{
    public record CandidateAdvancementResult(bool Advanced, string? NextRoundTitle, string? NextRoundExamPasscode, string CandidateStatus);

    /// <summary>
    /// Shared by PublishAssessmentResultCommand (Phase 4) and PublishInterviewResultCommand
    /// (Phase 5): once a round is resolved as Passed/Failed, either move CurrentPipelineProgressId
    /// to the next pre-created round (issuing a fresh exam passcode if it's an Assessment round)
    /// or resolve the candidate to Offered/Rejected if there's no next round.
    /// </summary>
    public interface ICandidateAdvancementService
    {
        Task<CandidateAdvancementResult> AdvanceOrResolveAsync(
            CandidateEntity candidate, CandidatePipelineProgressEntity completedProgress, bool passed, CancellationToken cancellationToken);
    }
}
