using FluentValidation;

namespace STEP.Application.Features.Exams.Commands.SubmitExam
{
    public class SubmitExamCommandValidator : AbstractValidator<SubmitExamCommand>
    {
        public SubmitExamCommandValidator()
        {
            RuleFor(x => x.SessionToken).NotEmpty();
        }
    }
}
