using FluentValidation;

namespace STEP.Application.Features.Interviews.Commands.PublishInterviewResult
{
    public class PublishInterviewResultCommandValidator : AbstractValidator<PublishInterviewResultCommand>
    {
        public PublishInterviewResultCommandValidator()
        {
            RuleFor(x => x.InterviewId).GreaterThan(0);
        }
    }
}
