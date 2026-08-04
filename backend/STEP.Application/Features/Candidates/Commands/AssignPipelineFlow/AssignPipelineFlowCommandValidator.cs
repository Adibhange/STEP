using FluentValidation;

namespace STEP.Application.Features.Candidates.Commands.AssignPipelineFlow
{
    public class AssignPipelineFlowCommandValidator : AbstractValidator<AssignPipelineFlowCommand>
    {
        public AssignPipelineFlowCommandValidator()
        {
            RuleFor(x => x.CandidateId).GreaterThan(0);
            RuleFor(x => x.VacancyPipelineFlowId).GreaterThan(0);
        }
    }
}
