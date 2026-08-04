using System;
using FluentValidation;

namespace STEP.Application.Features.Offers.Commands.GenerateOfferLetter
{
    public class GenerateOfferLetterCommandValidator : AbstractValidator<GenerateOfferLetterCommand>
    {
        public GenerateOfferLetterCommandValidator()
        {
            RuleFor(x => x.CandidateId).GreaterThan(0);
            RuleFor(x => x.OfferedCTC).GreaterThan(0);
            RuleFor(x => x.JoiningDate).GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("JoiningDate must not be in the past.");
        }
    }
}
