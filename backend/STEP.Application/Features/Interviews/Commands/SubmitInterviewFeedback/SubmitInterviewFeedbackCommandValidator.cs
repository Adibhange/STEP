using FluentValidation;

namespace STEP.Application.Features.Interviews.Commands.SubmitInterviewFeedback
{
    public class SubmitInterviewFeedbackCommandValidator : AbstractValidator<SubmitInterviewFeedbackCommand>
    {
        public SubmitInterviewFeedbackCommandValidator()
        {
            RuleFor(x => x.InterviewId).GreaterThan(0);
            RuleFor(x => x.PanelistUserId).GreaterThan(0);
            RuleFor(x => x.TechnicalRating).InclusiveBetween(1, 5);
            RuleFor(x => x.CommunicationRating).InclusiveBetween(1, 5);
            RuleFor(x => x.ProblemSolvingRating).InclusiveBetween(1, 5);
            RuleFor(x => x.CulturalFitRating).InclusiveBetween(1, 5);
            RuleFor(x => x.Recommendation).Must(v => v is "Hire" or "Reject" or "OnHold").WithMessage("Recommendation must be 'Hire', 'Reject', or 'OnHold'.");
        }
    }
}
