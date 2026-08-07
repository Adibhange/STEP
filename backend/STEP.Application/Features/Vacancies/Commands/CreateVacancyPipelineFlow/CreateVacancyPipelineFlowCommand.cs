using System.Collections.Generic;
using MediatR;
using STEP.Application.Features.Vacancies.Common;

namespace STEP.Application.Features.Vacancies.Commands.CreateVacancyPipelineFlow
{
    public record CreateRoundInput(int RoundOrder, string Name, string RoundType, decimal CutoffPercent);

    /// <summary>
    /// Adds an additional pipeline flow version to an already-created vacancy — e.g. for A/B
    /// testing an alternate interview sequence alongside the one saved at vacancy creation
    /// (see CreateVacancyCommand, which seeds the first flow(s) directly).
    /// </summary>
    public record CreateVacancyPipelineFlowCommand(
        int VacancyId,
        string VersionName,
        string? Description,
        bool IsDefault,
        List<CreateRoundInput> Rounds
    ) : IRequest<PipelineFlowDto>;
}
