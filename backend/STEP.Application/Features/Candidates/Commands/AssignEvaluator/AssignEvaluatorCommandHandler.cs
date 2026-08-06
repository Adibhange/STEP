using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.Candidates.Commands.AssignEvaluator
{
    public record AssignEvaluatorCommand(int CandidateId, int RoundNumber, int EvaluatorUserId) : IRequest<CandidateDto>;

    public class AssignEvaluatorCommandHandler(IApplicationDbContext db, IMediator mediator) : IRequestHandler<AssignEvaluatorCommand, CandidateDto>
    {
        public async Task<CandidateDto> Handle(AssignEvaluatorCommand request, CancellationToken cancellationToken)
        {
            var candidate = await db.Candidates
                .Include(c => c.PipelineProgressHistory)
                .FirstOrDefaultAsync(c => c.Id == request.CandidateId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateEntity), request.CandidateId);

            var progress = candidate.PipelineProgressHistory.FirstOrDefault(p => p.RoundNumber == request.RoundNumber);
            if (progress == null)
            {
                var flowRound = await db.VacancyPipelineFlowRounds
                    .FirstOrDefaultAsync(r => r.VacancyPipelineFlow.VacancyId == candidate.VacancyId && r.RoundOrder == request.RoundNumber, cancellationToken);

                var roundId = flowRound?.Id ?? await db.VacancyPipelineFlowRounds.Select(r => r.Id).FirstOrDefaultAsync(cancellationToken);

                progress = new STEP.Domain.Entities.Candidate.CandidatePipelineProgress
                {
                    CandidateId = candidate.Id,
                    VacancyPipelineFlowRoundId = roundId,
                    RoundNumber = request.RoundNumber,
                    RoundTitle = request.RoundNumber == 2 ? "Coding & Algorithm Challenge" : $"Round {request.RoundNumber}",
                    RoundType = request.RoundNumber == 2 ? "Assessment" : "Interview",
                    Status = "Assigned",
                };
                candidate.PipelineProgressHistory.Add(progress);
            }

            var evaluatorExists = await db.Users.AnyAsync(u => u.Id == request.EvaluatorUserId, cancellationToken);
            if (!evaluatorExists)
            {
                throw new NotFoundException(nameof(STEP.Domain.Entities.Identity.User), request.EvaluatorUserId);
            }

            progress.EvaluatorId = request.EvaluatorUserId;
            await db.SaveChangesAsync(cancellationToken);

            return await mediator.Send(new Queries.GetCandidateById.GetCandidateByIdQuery(candidate.Id), cancellationToken);
        }
    }
}
