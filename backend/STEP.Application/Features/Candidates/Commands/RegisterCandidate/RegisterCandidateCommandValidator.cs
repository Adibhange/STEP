using System.Linq;
using FluentValidation;

namespace STEP.Application.Features.Candidates.Commands.RegisterCandidate
{
    public class RegisterCandidateCommandValidator : AbstractValidator<RegisterCandidateCommand>
    {
        private static readonly string[] AllowedChannels = ["Walk-in", "Office", "Referral", "Portal", "Recruiter"];

        public RegisterCandidateCommandValidator()
        {
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(150);
            RuleFor(x => x.Phone).NotEmpty().Matches("^[0-9]{10}$").WithMessage("Phone must be exactly 10 digits.");
            RuleFor(x => x.VacancyId).GreaterThan(0);
            RuleFor(x => x.RegistrationChannel).Must(v => AllowedChannels.Contains(v))
                .WithMessage($"RegistrationChannel must be one of: {string.Join(", ", AllowedChannels)}.");
            RuleFor(x => x.TotalExperienceYears).GreaterThanOrEqualTo(0);
            RuleFor(x => x.ReferralEmployeeName).NotEmpty().When(x => x.RegistrationChannel == "Referral")
                .WithMessage("ReferralEmployeeName is required when RegistrationChannel is 'Referral'.");
        }
    }
}
