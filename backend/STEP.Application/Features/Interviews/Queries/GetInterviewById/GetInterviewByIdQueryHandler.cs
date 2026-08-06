using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Interviews.Common;
using STEP.Domain.Entities.Interview;

namespace STEP.Application.Features.Interviews.Queries.GetInterviewById
{
    public class GetInterviewByIdQueryHandler(IApplicationDbContext db) : IRequestHandler<GetInterviewByIdQuery, InterviewDto>
    {
        public async Task<InterviewDto> Handle(GetInterviewByIdQuery request, CancellationToken cancellationToken)
        {
            var interview = await db.Interviews
                .Include(i => i.Candidate).ThenInclude(c => c.Vacancy)
                .Include(i => i.InterviewerUser)
                .Include(i => i.RoundDetails).ThenInclude(d => d.Panelist)
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken)
                ?? throw new NotFoundException(nameof(Interview), request.Id);

            var roundDetails = interview.RoundDetails
                .Select(d => new InterviewRoundDetailDto(
                    d.Id, d.PanelistUserId, $"{d.Panelist.FirstName} {d.Panelist.LastName}", d.TechnicalRating, d.CommunicationRating,
                    d.ProblemSolvingRating, d.CulturalFitRating, d.Strengths, d.Weaknesses, d.Recommendation, d.Comments, d.SubmittedAt))
                .ToList();

            return new InterviewDto(
                interview.Id, interview.CandidateId, $"{interview.Candidate.FirstName} {interview.Candidate.LastName}",
                interview.Candidate.Vacancy.Title, interview.InterviewerUserId,
                interview.InterviewerUser != null ? $"{interview.InterviewerUser.FirstName} {interview.InterviewerUser.LastName}" : null,
                interview.ScheduledAt, interview.DurationMinutes, interview.Mode,
                interview.MeetingLinkOrLocation, interview.Status, roundDetails);
        }
    }
}
