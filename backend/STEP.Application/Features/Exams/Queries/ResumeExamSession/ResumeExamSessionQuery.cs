using MediatR;
using STEP.Application.Features.Exams.Common;

namespace STEP.Application.Features.Exams.Queries.ResumeExamSession
{
    /// <summary>Instant reload hydration — reads back an already-created session by its token, never re-snapshots.</summary>
    public record ResumeExamSessionQuery(string SessionToken) : IRequest<LiveExamWorkspaceDto>;
}
