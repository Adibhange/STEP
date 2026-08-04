using FluentValidation;

namespace STEP.Application.Features.QR.Commands.RegisterCandidateViaQR
{
    public class RegisterCandidateViaQRCommandValidator : AbstractValidator<RegisterCandidateViaQRCommand>
    {
        public RegisterCandidateViaQRCommandValidator()
        {
            RuleFor(x => x.Code).NotEmpty();
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(150);
            RuleFor(x => x.Phone).NotEmpty().Matches("^[0-9]{10}$").WithMessage("Phone must be exactly 10 digits.");
            RuleFor(x => x.TotalExperienceYears).GreaterThanOrEqualTo(0);
        }
    }
}
