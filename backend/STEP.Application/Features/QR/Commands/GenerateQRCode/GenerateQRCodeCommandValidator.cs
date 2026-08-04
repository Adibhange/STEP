using FluentValidation;

namespace STEP.Application.Features.QR.Commands.GenerateQRCode
{
    public class GenerateQRCodeCommandValidator : AbstractValidator<GenerateQRCodeCommand>
    {
        public GenerateQRCodeCommandValidator()
        {
            RuleFor(x => x.VacancyId).GreaterThan(0);
            RuleFor(x => x.VenueName).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Capacity).GreaterThan(0).When(x => x.Capacity.HasValue);
        }
    }
}
