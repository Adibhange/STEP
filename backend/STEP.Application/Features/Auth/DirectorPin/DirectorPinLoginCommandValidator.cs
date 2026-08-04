using FluentValidation;

namespace STEP.Application.Features.Auth.DirectorPin
{
    public class DirectorPinLoginCommandValidator : AbstractValidator<DirectorPinLoginCommand>
    {
        public DirectorPinLoginCommandValidator()
        {
            RuleFor(x => x.Pin).NotEmpty().Length(6).Matches("^[0-9]{6}$").WithMessage("PIN must be exactly 6 digits.");
        }
    }
}
