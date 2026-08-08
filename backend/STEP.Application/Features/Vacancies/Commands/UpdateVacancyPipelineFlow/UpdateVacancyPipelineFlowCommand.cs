using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Vacancies.Common;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Application.Features.Vacancies.Commands.UpdateVacancyPipelineFlow
{
    public record UpdateRoundInput(int? Id, int RoundOrder, string Name, string RoundType, decimal CutoffPercent);

    public record UpdateVacancyPipelineFlowCommand(
        int VacancyId,
        int FlowId,
        string VersionName,
        string? Description,
        bool IsDefault,
        List<UpdateRoundInput> Rounds
    ) : IRequest<PipelineFlowDto>;

    public class UpdateVacancyPipelineFlowCommandHandler(IApplicationDbContext db)
        : IRequestHandler<UpdateVacancyPipelineFlowCommand, PipelineFlowDto>
    {
        public async Task<PipelineFlowDto> Handle(UpdateVacancyPipelineFlowCommand request, CancellationToken cancellationToken)
        {
            var flow = await db.VacancyPipelineFlows
                .Include(f => f.Rounds)
                .FirstOrDefaultAsync(f => f.Id == request.FlowId && f.VacancyId == request.VacancyId, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyPipelineFlow), request.FlowId);

            flow.VersionName = request.VersionName;
            flow.Description = request.Description;

            if (request.IsDefault && !flow.IsDefault)
            {
                // Only one flow per vacancy can be the walk-in default at a time.
                var siblingDefaults = await db.VacancyPipelineFlows
                    .Where(f => f.VacancyId == request.VacancyId && f.Id != flow.Id && f.IsDefault)
                    .ToListAsync(cancellationToken);
                foreach (var sibling in siblingDefaults)
                {
                    sibling.IsDefault = false;
                }
            }
            flow.IsDefault = request.IsDefault;

            // Remove rounds no longer present in request
            var inputRoundIds = request.Rounds.Where(r => r.Id.HasValue).Select(r => r.Id!.Value).ToHashSet();
            var roundsToRemove = flow.Rounds.Where(r => !inputRoundIds.Contains(r.Id)).ToList();
            foreach (var r in roundsToRemove)
            {
                db.VacancyPipelineFlowRounds.Remove(r);
            }

            // Update existing or add new rounds
            foreach (var rInput in request.Rounds)
            {
                if (rInput.Id.HasValue && rInput.Id.Value > 0)
                {
                    var existingRound = flow.Rounds.FirstOrDefault(r => r.Id == rInput.Id.Value);
                    if (existingRound != null)
                    {
                        existingRound.RoundOrder = rInput.RoundOrder;
                        existingRound.Name = rInput.Name;
                        existingRound.RoundType = rInput.RoundType;
                        existingRound.CutoffPercent = rInput.CutoffPercent;
                    }
                }
                else
                {
                    flow.Rounds.Add(new VacancyPipelineFlowRound
                    {
                        VacancyPipelineFlowId = flow.Id,
                        RoundOrder = rInput.RoundOrder,
                        Name = rInput.Name,
                        RoundType = rInput.RoundType,
                        CutoffPercent = rInput.CutoffPercent
                    });
                }
            }
            STEP.Application.Common.PipelineFlowRoundDefaults.EnsureEndsWithDirectorRound(flow.Rounds);

            await db.SaveChangesAsync(cancellationToken);

            var updatedRounds = flow.Rounds
                .OrderBy(r => r.RoundOrder)
                .Select(r => new PipelineRoundDto(r.Id, r.RoundOrder, r.Name, r.RoundType, r.CutoffPercent))
                .ToList();

            return new PipelineFlowDto(flow.Id, flow.VersionName, flow.Description, flow.IsDefault, updatedRounds);
        }
    }
}
