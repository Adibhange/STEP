using FluentValidation;

namespace STEP.Application.Features.Users.Commands.CreateUser
{
    public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
    {
        public CreateUserCommandValidator()
        {
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(150);
            RuleFor(x => x.TempPassword).NotEmpty().MinimumLength(8);
            RuleFor(x => x.RoleId).NotEmpty();
            RuleFor(x => x.Pin).Length(4).Matches("^[0-9]{4}$").When(x => !string.IsNullOrEmpty(x.Pin))
                .WithMessage("PIN must be exactly 4 digits.");
        }
    }
}
