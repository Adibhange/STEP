using MediatR;
using STEP.Application.Features.Exams.Common;

namespace STEP.Application.Features.Exams.Commands.StartExamSession
{
    /// <summary>
    /// Deviates from the blueprint's literal (CandidateCode, Passcode, SessionToken) signature in
    /// one way: the SessionToken is generated server-side rather than accepted from the caller —
    /// accepting a client-chosen token for a brand-new session has no security upside and some
    /// downside. Resuming an in-progress session by token is ResumeExamSessionQuery's job.
    /// </summary>
    public record StartExamSessionCommand(
        string CandidateCode,
        string Passcode,
        string TestSource,
        string? IpAddress,
        string? UserAgent) : IRequest<LiveExamWorkspaceDto>;
}
