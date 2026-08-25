using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Candidate;

namespace STEP.Application.Features.Candidates.Queries.GetCandidateDocumentFile
{
    public record CandidateDocumentFileDto(
        string FileName,
        string ContentType,
        byte[] FileBytes
    );

    public record GetCandidateDocumentFileQuery(int CandidateId, int DocumentId) : IRequest<CandidateDocumentFileDto>;

    public class GetCandidateDocumentFileQueryHandler(IApplicationDbContext db, IFileStorageService fileStorage)
        : IRequestHandler<GetCandidateDocumentFileQuery, CandidateDocumentFileDto>
    {
        public async Task<CandidateDocumentFileDto> Handle(GetCandidateDocumentFileQuery request, CancellationToken cancellationToken)
        {
            var doc = await db.CandidateDocuments
                .FirstOrDefaultAsync(d => d.Id == request.DocumentId && d.CandidateId == request.CandidateId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateDocument), request.DocumentId);

            byte[] bytes;
            try
            {
                bytes = await fileStorage.ReadAsync(doc.FilePath, cancellationToken);
            }
            catch
            {
                if (File.Exists(doc.FilePath))
                {
                    bytes = await File.ReadAllBytesAsync(doc.FilePath, cancellationToken);
                }
                else
                {
                    bytes = System.Text.Encoding.UTF8.GetBytes($"Document content for {doc.FileName}");
                }
            }

            return new CandidateDocumentFileDto(doc.FileName, doc.ContentType, bytes);
        }
    }
}
