using MediatR;
using STEP.Application.Features.Interviews.Common;

namespace STEP.Application.Features.Interviews.Commands.PublishInterviewResult
{
    public record PublishInterviewResultCommand(int InterviewId, bool Passed, string? Remarks, int PublishedByUserId) : IRequest<InterviewPublishResultDto>;
}
