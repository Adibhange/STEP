using FluentValidation;

namespace STEP.Application.Features.Vacancies.Commands.CreateVacancyPipelineFlow
{
    public class CreateVacancyPipelineFlowCommandValidator : AbstractValidator<CreateVacancyPipelineFlowCommand>
    {
        public CreateVacancyPipelineFlowCommandValidator()
        {
            RuleFor(x => x.VacancyId).NotEmpty();
            RuleFor(x => x.VersionName).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Rounds).NotEmpty().WithMessage("A pipeline flow needs at least one round.");
        }
    }
}
