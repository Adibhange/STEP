using FluentValidation;

namespace STEP.Application.Features.QR.Commands.RegisterUniversalCandidate
{
    public class RegisterUniversalCandidateCommandValidator : AbstractValidator<RegisterUniversalCandidateCommand>
    {
        public RegisterUniversalCandidateCommandValidator()
        {
            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("First name is required.")
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters.");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Last name is required.")
                .MaximumLength(100).WithMessage("Last name must not exceed 100 characters.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email address is required.")
                .EmailAddress().WithMessage("A valid email address is required.")
                .MaximumLength(200).WithMessage("Email must not exceed 200 characters.");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Phone number is required.")
                .Matches(@"^[6-9]\d{9}$").WithMessage("Enter a valid 10-digit mobile number.");

            RuleFor(x => x.RoleIdentifier)
                .NotEmpty().WithMessage("Target designation / role is required.");

            RuleFor(x => x.LocationIdentifier)
                .NotEmpty().WithMessage("Assessment / hiring center is required.");

            RuleFor(x => x.ApplicationChannel)
                .NotEmpty().WithMessage("Application channel stream is required.");

            RuleFor(x => x.TotalExperienceYears)
                .GreaterThanOrEqualTo(0).WithMessage("Experience years cannot be negative.")
                .LessThanOrEqualTo(50).WithMessage("Experience years must be 50 or less.");
        }
    }
}
