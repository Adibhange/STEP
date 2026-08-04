using System.IO;
using MediatR;
using STEP.Application.Features.Candidates.Common;

namespace STEP.Application.Features.Candidates.Commands.UploadCandidateDocument
{
    /// <summary>Re-uploading the same DocumentType for a candidate replaces the existing row (one slot per type).</summary>
    public record UploadCandidateDocumentCommand(
        int CandidateId,
        string DocumentType,
        string FileName,
        string ContentType,
        long FileSizeBytes,
        Stream FileStream,
        int? UploadedById) : IRequest<CandidateDocumentDto>;
}
