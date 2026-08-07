using MediatR;

namespace STEP.Application.Features.Vacancies.Commands.DeleteVacancyPipelineFlow
{
    public record DeleteVacancyPipelineFlowCommand(int VacancyId, int FlowId) : IRequest<bool>;
}
