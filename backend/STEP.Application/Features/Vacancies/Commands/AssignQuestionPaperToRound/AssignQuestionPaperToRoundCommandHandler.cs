using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Application.Features.Vacancies.Commands.AssignQuestionPaperToRound
{
    public class AssignQuestionPaperToRoundCommandHandler(IApplicationDbContext db) : IRequestHandler<AssignQuestionPaperToRoundCommand, bool>
    {
        public async Task<bool> Handle(AssignQuestionPaperToRoundCommand request, CancellationToken cancellationToken)
        {
            var round = await db.VacancyPipelineFlowRounds
                .Include(r => r.VacancyPipelineFlow)
                .FirstOrDefaultAsync(r => r.Id == request.VacancyPipelineFlowRoundId, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyPipelineFlowRound), request.VacancyPipelineFlowRoundId);

            var paper = await db.VacancyQuestionPapers.FirstOrDefaultAsync(p => p.Id == request.VacancyQuestionPaperId, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyQuestionPaper), request.VacancyQuestionPaperId);

            if (paper.VacancyId != round.VacancyPipelineFlow.VacancyId)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.VacancyQuestionPaperId),
                    "This question paper belongs to a different vacancy than this pipeline round.")]);
            }

            var link = await db.VacancyRoundAssessments.FirstOrDefaultAsync(ra => ra.VacancyPipelineFlowRoundId == round.Id, cancellationToken);
            if (link == null)
            {
                link = new VacancyRoundAssessment { VacancyPipelineFlowRoundId = round.Id };
                db.VacancyRoundAssessments.Add(link);
            }

            link.VacancyQuestionPaperId = paper.Id;

            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
