using MediatR;
using STEP.Application.Features.Candidates.Common;

namespace STEP.Application.Features.Candidates.Commands.AssignPipelineFlow
{
    /// <summary>ExamPasscode is non-null only when round 1 is an Assessment round — handed back in
    /// plaintext once (no email/SMS delivery channel exists until Phase 5's Outbox).</summary>
    public record AssignPipelineFlowResultDto(CandidateDto Candidate, string? ExamPasscode);

    /// <summary>
    /// Creates the candidate's full CandidatePipelineProgress skeleton (one row per round in the
    /// chosen flow, ordered by RoundNumber) and points CurrentPipelineProgressId at round 1.
    /// </summary>
    public record AssignPipelineFlowCommand(int CandidateId, int VacancyPipelineFlowId) : IRequest<AssignPipelineFlowResultDto>;
}
