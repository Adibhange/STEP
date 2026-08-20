using FluentValidation;

namespace STEP.Application.Features.Auth.DirectorPin
{
    public class DirectorPinLoginCommandValidator : AbstractValidator<DirectorPinLoginCommand>
    {
        public DirectorPinLoginCommandValidator()
        {
            RuleFor(x => x.Pin)
                .NotEmpty().WithMessage("PIN is required.")
                .Length(4).WithMessage("PIN must be exactly 4 digits.")
                .Matches("^[0-9]{4}$").WithMessage("PIN must be exactly 4 numeric digits.");
        }
    }
}
