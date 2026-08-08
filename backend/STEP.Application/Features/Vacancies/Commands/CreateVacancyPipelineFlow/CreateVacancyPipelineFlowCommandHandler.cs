using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Vacancies.Common;
using STEP.Domain.Entities.Vacancy;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;

namespace STEP.Application.Features.Vacancies.Commands.CreateVacancyPipelineFlow
{
    public class CreateVacancyPipelineFlowCommandHandler(IApplicationDbContext db)
        : IRequestHandler<CreateVacancyPipelineFlowCommand, PipelineFlowDto>
    {
        public async Task<PipelineFlowDto> Handle(CreateVacancyPipelineFlowCommand request, CancellationToken cancellationToken)
        {
            var vacancyExists = await db.Vacancies.AnyAsync(v => v.Id == request.VacancyId, cancellationToken);
            if (!vacancyExists)
            {
                throw new NotFoundException(nameof(VacancyEntity), request.VacancyId);
            }

            if (request.IsDefault)
            {
                var existingDefaults = await db.VacancyPipelineFlows
                    .Where(f => f.VacancyId == request.VacancyId && f.IsDefault)
                    .ToListAsync(cancellationToken);
                foreach (var existing in existingDefaults)
                {
                    existing.IsDefault = false;
                }
            }

            var flow = new VacancyPipelineFlow
            {
                VacancyId = request.VacancyId,
                VersionName = request.VersionName,
                Description = request.Description,
                IsDefault = request.IsDefault,
            };

            foreach (var round in request.Rounds.OrderBy(r => r.RoundOrder))
            {
                flow.Rounds.Add(new VacancyPipelineFlowRound
                {
                    RoundOrder = round.RoundOrder,
                    Name = round.Name,
                    RoundType = round.RoundType,
                    CutoffPercent = round.CutoffPercent,
                });
            }
            STEP.Application.Common.PipelineFlowRoundDefaults.EnsureEndsWithDirectorRound(flow.Rounds);

            db.VacancyPipelineFlows.Add(flow);
            await db.SaveChangesAsync(cancellationToken);

            var rounds = flow.Rounds
                .OrderBy(r => r.RoundOrder)
                .Select(r => new PipelineRoundDto(r.Id, r.RoundOrder, r.Name, r.RoundType, r.CutoffPercent))
                .ToList();

            return new PipelineFlowDto(flow.Id, flow.VersionName, flow.Description, flow.IsDefault, rounds);
        }
    }
}
