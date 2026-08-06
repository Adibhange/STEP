using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Candidate;

namespace STEP.Application.Features.Candidates.Commands.DeleteCandidateDocument
{
    public record DeleteCandidateDocumentCommand(int CandidateId, int DocumentId) : IRequest<bool>;

    public class DeleteCandidateDocumentCommandHandler(IApplicationDbContext db)
        : IRequestHandler<DeleteCandidateDocumentCommand, bool>
    {
        public async Task<bool> Handle(DeleteCandidateDocumentCommand request, CancellationToken cancellationToken)
        {
            var doc = await db.CandidateDocuments
                .FirstOrDefaultAsync(d => d.Id == request.DocumentId && d.CandidateId == request.CandidateId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateDocument), request.DocumentId);

            doc.IsDeleted = true;
            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
