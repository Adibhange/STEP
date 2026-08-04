using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;
using CandidateDocumentEntity = STEP.Domain.Entities.Candidate.CandidateDocument;

namespace STEP.Application.Features.Candidates.Commands.UploadCandidateDocument
{
    public class UploadCandidateDocumentCommandHandler(IApplicationDbContext db, IFileStorageService fileStorage)
        : IRequestHandler<UploadCandidateDocumentCommand, CandidateDocumentDto>
    {
        public async Task<CandidateDocumentDto> Handle(UploadCandidateDocumentCommand request, CancellationToken cancellationToken)
        {
            var candidateExists = await db.Candidates.AnyAsync(c => c.Id == request.CandidateId, cancellationToken);
            if (!candidateExists)
            {
                throw new NotFoundException(nameof(CandidateEntity), request.CandidateId);
            }

            var storedPath = await fileStorage.SaveAsync($"candidates/{request.CandidateId}", request.FileName, request.FileStream, cancellationToken);

            var existing = await db.CandidateDocuments
                .FirstOrDefaultAsync(d => d.CandidateId == request.CandidateId && d.DocumentType == request.DocumentType, cancellationToken);

            if (existing != null)
            {
                existing.FileName = request.FileName;
                existing.FilePath = storedPath;
                existing.ContentType = request.ContentType;
                existing.FileSizeBytes = request.FileSizeBytes;
                existing.StorageProvider = fileStorage.ProviderName;
                existing.UploadedById = request.UploadedById;
                existing.UploadedAt = System.DateTime.UtcNow;
            }
            else
            {
                existing = new CandidateDocumentEntity
                {
                    CandidateId = request.CandidateId,
                    DocumentType = request.DocumentType,
                    FileName = request.FileName,
                    FilePath = storedPath,
                    ContentType = request.ContentType,
                    FileSizeBytes = request.FileSizeBytes,
                    StorageProvider = fileStorage.ProviderName,
                    UploadedById = request.UploadedById,
                };
                db.CandidateDocuments.Add(existing);
            }

            await db.SaveChangesAsync(cancellationToken);

            return new CandidateDocumentDto(existing.Id, existing.DocumentType, existing.FileName, existing.ContentType,
                existing.FileSizeBytes, existing.StorageProvider, existing.UploadedAt);
        }
    }
}
