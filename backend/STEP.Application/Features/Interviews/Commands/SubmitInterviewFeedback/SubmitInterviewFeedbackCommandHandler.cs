using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Interview;

namespace STEP.Application.Features.Interviews.Commands.SubmitInterviewFeedback
{
    public class SubmitInterviewFeedbackCommandHandler(IApplicationDbContext db, ICurrentUserService? currentUser = null) : IRequestHandler<SubmitInterviewFeedbackCommand, bool>
    {
        public async Task<bool> Handle(SubmitInterviewFeedbackCommand request, CancellationToken cancellationToken)
        {
            var interview = await db.Interviews
                .FirstOrDefaultAsync(i => i.Id == request.InterviewId, cancellationToken);
            if (interview == null)
            {
                throw new NotFoundException(nameof(Interview), request.InterviewId);
            }

            if (currentUser != null && currentUser.Role == "Interviewer" && currentUser.UserId.HasValue)
            {
                if (interview.InterviewerUserId != currentUser.UserId.Value)
                {
                    throw new System.UnauthorizedAccessException("You are not assigned to conduct or submit feedback for this interview round.");
                }
            }

            var scorecard = await db.InterviewRoundDetails
                .FirstOrDefaultAsync(d => d.InterviewId == request.InterviewId && d.PanelistUserId == request.PanelistUserId, cancellationToken);

            if (scorecard == null)
            {
                scorecard = new InterviewRoundDetail
                {
                    InterviewId = request.InterviewId,
                    PanelistUserId = request.PanelistUserId,
                };
                db.InterviewRoundDetails.Add(scorecard);
            }

            scorecard.TechnicalRating = request.TechnicalRating;
            scorecard.CommunicationRating = request.CommunicationRating;
            scorecard.ProblemSolvingRating = request.ProblemSolvingRating;
            scorecard.CulturalFitRating = request.CulturalFitRating;
            scorecard.Strengths = request.Strengths;
            scorecard.Weaknesses = request.Weaknesses;
            scorecard.Recommendation = request.Recommendation;
            scorecard.Comments = request.Comments;
            scorecard.SubmittedAt = System.DateTime.UtcNow;

            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
