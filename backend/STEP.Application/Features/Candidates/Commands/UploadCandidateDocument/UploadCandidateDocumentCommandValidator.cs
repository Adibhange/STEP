using System.Linq;
using FluentValidation;

namespace STEP.Application.Features.Candidates.Commands.UploadCandidateDocument
{
    public class UploadCandidateDocumentCommandValidator : AbstractValidator<UploadCandidateDocumentCommand>
    {
        public static readonly string[] AllowedDocumentTypes = ["Resume", "Application Form", "Profile Photo"];
        private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10MB, matches the frontend's stated resume upload limit.

        public UploadCandidateDocumentCommandValidator()
        {
            RuleFor(x => x.CandidateId).GreaterThan(0);
            RuleFor(x => x.DocumentType).Must(v => AllowedDocumentTypes.Contains(v))
                .WithMessage($"DocumentType must be one of: {string.Join(", ", AllowedDocumentTypes)}.");
            RuleFor(x => x.FileName).NotEmpty().MaximumLength(255);
            RuleFor(x => x.FileSizeBytes).GreaterThan(0).LessThanOrEqualTo(MaxFileSizeBytes)
                .WithMessage("File must be between 1 byte and 10MB.");
        }
    }
}
