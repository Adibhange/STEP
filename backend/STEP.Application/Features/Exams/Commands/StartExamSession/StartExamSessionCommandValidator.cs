using FluentValidation;

namespace STEP.Application.Features.Exams.Commands.StartExamSession
{
    public class StartExamSessionCommandValidator : AbstractValidator<StartExamSessionCommand>
    {
        public StartExamSessionCommandValidator()
        {
            RuleFor(x => x.CandidateCode).NotEmpty();
            RuleFor(x => x.Passcode).NotEmpty();
            RuleFor(x => x.TestSource)
                .Must(v => v is "Home" or "Office" or "Online" or "In Office" or "Remote" or "Walk-in")
                .WithMessage("TestSource must be a valid source ('Home', 'Office', 'Online', 'In Office').");
        }
    }
}
