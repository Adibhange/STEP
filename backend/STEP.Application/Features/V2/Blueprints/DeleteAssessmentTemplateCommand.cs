using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;

namespace STEP.Application.Features.V2.Blueprints
{
    public record DeleteAssessmentTemplateCommand(int Id) : IRequest<bool>;

    public class DeleteAssessmentTemplateCommandHandler(IApplicationDbContext db)
        : IRequestHandler<DeleteAssessmentTemplateCommand, bool>
    {
        public async Task<bool> Handle(DeleteAssessmentTemplateCommand request, CancellationToken cancellationToken)
        {
            var activeVacancyExists = await db.Vacancies
                .AnyAsync(v => v.AssessmentBlueprintId == request.Id 
                            && v.Status != "Closed" 
                            && v.Status != "Cancelled" 
                            && !v.IsDeleted, cancellationToken);

            if (activeVacancyExists)
            {
                throw new InvalidOperationException("Cannot delete Assessment Template: it is currently assigned to one or more active vacancies.");
            }

            var blueprint = await db.AssessmentBlueprints.FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken);
            if (blueprint != null)
            {
                blueprint.IsActive = false;
                await db.SaveChangesAsync(cancellationToken);
                return true;
            }

            return false;
        }
    }
}
