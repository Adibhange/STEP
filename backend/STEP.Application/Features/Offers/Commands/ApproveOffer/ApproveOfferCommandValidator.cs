using FluentValidation;

namespace STEP.Application.Features.Offers.Commands.ApproveOffer
{
    public class ApproveOfferCommandValidator : AbstractValidator<ApproveOfferCommand>
    {
        public ApproveOfferCommandValidator()
        {
            RuleFor(x => x.OfferLetterId).GreaterThan(0);
            RuleFor(x => x.DirectorPin).NotEmpty().Length(4).Matches("^[0-9]{4}$").WithMessage("Director PIN must be exactly 4 digits.");
        }
    }
}
