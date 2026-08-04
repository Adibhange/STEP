using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Interviews.Common;
using STEP.Domain.Entities.Interview;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.Interviews.Commands.ScheduleInterview
{
    public class ScheduleInterviewCommandHandler(IApplicationDbContext db) : IRequestHandler<ScheduleInterviewCommand, InterviewDto>
    {
        public async Task<InterviewDto> Handle(ScheduleInterviewCommand request, CancellationToken cancellationToken)
        {
            var candidate = await db.Candidates
                .Include(c => c.Vacancy)
                .Include(c => c.CurrentPipelineProgress)
                .FirstOrDefaultAsync(c => c.Id == request.CandidateId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateEntity), request.CandidateId);

            var progress = candidate.CurrentPipelineProgress;
            if (progress == null || progress.RoundType != "Interview" || progress.Status is not ("Assigned" or "InProgress"))
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("CurrentPipelineProgress",
                    "There is no active interview round for this candidate right now.")]);
            }

            var interview = new Interview
            {
                CandidatePipelineProgressId = progress.Id,
                CandidateId = candidate.Id,
                ScheduledAt = request.ScheduledAt,
                DurationMinutes = request.DurationMinutes,
                Mode = request.Mode,
                MeetingLinkOrLocation = request.MeetingLinkOrLocation,
                Status = "Scheduled",
            };

            progress.Status = "InProgress";
            progress.StartedAt ??= DateTime.UtcNow;

            db.Interviews.Add(interview);
            await db.SaveChangesAsync(cancellationToken);

            return new InterviewDto(
                interview.Id, candidate.Id, $"{candidate.FirstName} {candidate.LastName}", candidate.Vacancy.Title,
                interview.ScheduledAt, interview.DurationMinutes, interview.Mode, interview.MeetingLinkOrLocation,
                interview.Status, []);
        }
    }
}
