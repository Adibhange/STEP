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

            var interviewerExists = await db.Users.AnyAsync(u => u.Id == request.InterviewerUserId, cancellationToken);
            if (!interviewerExists)
            {
                throw new NotFoundException(nameof(STEP.Domain.Entities.Identity.User), request.InterviewerUserId);
            }

            // Reassigning/rescheduling an already-scheduled round updates that same Interview row
            // rather than creating a second one — the "Assign Interviewer" modal re-opening on a
            // round that already has an interview is an edit, not a new booking.
            var interview = await db.Interviews
                .Where(i => i.CandidatePipelineProgressId == progress.Id && i.Status != "Cancelled")
                .OrderByDescending(i => i.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (interview == null)
            {
                interview = new Interview
                {
                    CandidatePipelineProgressId = progress.Id,
                    CandidateId = candidate.Id,
                };
                db.Interviews.Add(interview);
            }

            interview.InterviewerUserId = request.InterviewerUserId;
            interview.ScheduledAt = request.ScheduledAt;
            interview.DurationMinutes = request.DurationMinutes;
            interview.Mode = request.Mode;
            interview.MeetingLinkOrLocation = request.MeetingLinkOrLocation;
            interview.Status = "Scheduled";

            progress.Status = "InProgress";
            progress.StartedAt ??= DateTime.UtcNow;

            await db.SaveChangesAsync(cancellationToken);

            var interviewer = await db.Users.FirstAsync(u => u.Id == request.InterviewerUserId, cancellationToken);

            return new InterviewDto(
                interview.Id, candidate.Id, $"{candidate.FirstName} {candidate.LastName}", candidate.Vacancy.Title,
                interview.InterviewerUserId, $"{interviewer.FirstName} {interviewer.LastName}",
                interview.ScheduledAt, interview.DurationMinutes, interview.Mode, interview.MeetingLinkOrLocation,
                interview.Status, []);
        }
    }
}
