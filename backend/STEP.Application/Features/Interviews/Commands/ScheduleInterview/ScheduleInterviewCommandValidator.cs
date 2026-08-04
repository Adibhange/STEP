using FluentValidation;

namespace STEP.Application.Features.Interviews.Commands.ScheduleInterview
{
    public class ScheduleInterviewCommandValidator : AbstractValidator<ScheduleInterviewCommand>
    {
        public ScheduleInterviewCommandValidator()
        {
            RuleFor(x => x.CandidateId).GreaterThan(0);
            RuleFor(x => x.DurationMinutes).GreaterThan(0);
            RuleFor(x => x.Mode).Must(v => v is "Online" or "Onsite" or "Phone").WithMessage("Mode must be 'Online', 'Onsite', or 'Phone'.");
        }
    }
}
