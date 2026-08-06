using System;
using MediatR;
using STEP.Application.Features.Interviews.Common;

namespace STEP.Application.Features.Interviews.Commands.ScheduleInterview
{
    public record ScheduleInterviewCommand(
        int CandidateId,
        int InterviewerUserId,
        DateTime ScheduledAt,
        int DurationMinutes,
        string Mode,
        string? MeetingLinkOrLocation) : IRequest<InterviewDto>;
}
