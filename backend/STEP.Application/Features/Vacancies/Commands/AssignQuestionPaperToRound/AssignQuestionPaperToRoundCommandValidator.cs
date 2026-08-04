using FluentValidation;

namespace STEP.Application.Features.Vacancies.Commands.AssignQuestionPaperToRound
{
    public class AssignQuestionPaperToRoundCommandValidator : AbstractValidator<AssignQuestionPaperToRoundCommand>
    {
        public AssignQuestionPaperToRoundCommandValidator()
        {
            RuleFor(x => x.VacancyPipelineFlowRoundId).GreaterThan(0);
            RuleFor(x => x.VacancyQuestionPaperId).GreaterThan(0);
        }
    }
}
