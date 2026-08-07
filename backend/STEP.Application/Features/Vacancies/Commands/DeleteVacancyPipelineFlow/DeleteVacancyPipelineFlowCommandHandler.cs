using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Application.Features.Vacancies.Commands.DeleteVacancyPipelineFlow
{
    public class DeleteVacancyPipelineFlowCommandHandler(IApplicationDbContext db)
        : IRequestHandler<DeleteVacancyPipelineFlowCommand, bool>
    {
        public async Task<bool> Handle(DeleteVacancyPipelineFlowCommand request, CancellationToken cancellationToken)
        {
            var flow = await db.VacancyPipelineFlows
                .Include(f => f.Rounds)
                .FirstOrDefaultAsync(f => f.Id == request.FlowId && f.VacancyId == request.VacancyId, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyPipelineFlow), request.FlowId);

            var siblingCount = await db.VacancyPipelineFlows.CountAsync(f => f.VacancyId == request.VacancyId, cancellationToken);
            if (siblingCount <= 1)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.FlowId),
                    "A vacancy must keep at least one pipeline flow version — create a replacement before deleting this one.")]);
            }

            var roundIds = flow.Rounds.Select(r => r.Id).ToList();
            var hasAssignedCandidates = await db.CandidatePipelineProgresses
                .AnyAsync(p => roundIds.Contains(p.VacancyPipelineFlowRoundId), cancellationToken);
            if (hasAssignedCandidates)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.FlowId),
                    "This flow version already has candidates assigned to it and can no longer be deleted.")]);
            }

            db.VacancyPipelineFlows.Remove(flow);
            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
