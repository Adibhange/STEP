using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.Candidates.Commands.UpdateCandidate
{
    public record UpdateCandidateCommand(
        int CandidateId,
        string FirstName,
        string LastName,
        string Email,
        string Phone,
        string? CurrentLocation,
        string? HighestQualification,
        decimal TotalExperienceYears,
        decimal? CurrentCTC,
        decimal? ExpectedCTC,
        int? NoticePeriodDays
    ) : IRequest<CandidateDto>;

    public class UpdateCandidateCommandHandler(IApplicationDbContext db)
        : IRequestHandler<UpdateCandidateCommand, CandidateDto>
    {
        public async Task<CandidateDto> Handle(UpdateCandidateCommand request, CancellationToken cancellationToken)
        {
            var candidate = await db.Candidates
                .Include(c => c.Vacancy)
                .Include(c => c.Documents)
                .Include(c => c.PipelineProgressHistory)
                .FirstOrDefaultAsync(c => c.Id == request.CandidateId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateEntity), request.CandidateId);

            candidate.FirstName = request.FirstName;
            candidate.LastName = request.LastName;
            candidate.Email = request.Email;
            candidate.Phone = request.Phone;
            candidate.CurrentLocation = request.CurrentLocation;
            candidate.HighestQualification = request.HighestQualification;
            candidate.TotalExperienceYears = request.TotalExperienceYears;
            candidate.CurrentCTC = request.CurrentCTC;
            candidate.ExpectedCTC = request.ExpectedCTC;
            candidate.NoticePeriodDays = request.NoticePeriodDays;

            await db.SaveChangesAsync(cancellationToken);

            var progressDtos = candidate.PipelineProgressHistory
                .OrderBy(p => p.RoundNumber)
                .Select(p => new PipelineProgressDto(
                    p.Id, p.RoundNumber, p.RoundTitle, p.RoundType, p.Status,
                    p.ScoreObtained, p.StartedAt, p.CompletedAt, null, null))
                .ToList();

            var docDtos = candidate.Documents
                .Select(d => new CandidateDocumentDto(d.Id, d.DocumentType, d.FileName, d.ContentType, d.FileSizeBytes, d.StorageProvider, d.UploadedAt))
                .ToList();

            return new CandidateDto(
                candidate.Id, candidate.CandidateCode, candidate.FirstName, candidate.LastName, candidate.Email, candidate.Phone,
                candidate.VacancyId, candidate.Vacancy?.Title ?? "N/A", candidate.CurrentStage, candidate.Status, candidate.RegistrationChannel,
                candidate.ReferralEmployeeName, candidate.TotalExperienceYears, candidate.CurrentCTC, candidate.ExpectedCTC,
                candidate.NoticePeriodDays, candidate.CurrentLocation, candidate.HighestQualification, candidate.CreatedAt,
                progressDtos, docDtos);
        }
    }
}
