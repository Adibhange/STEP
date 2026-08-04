using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Offers.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Interview;
using STEP.Domain.Entities.Notification;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.Offers.Commands.GenerateOfferLetter
{
    public class GenerateOfferLetterCommandHandler(IApplicationDbContext db, IOfferLetterPdfGenerator pdfGenerator, IFileStorageService fileStorage)
        : IRequestHandler<GenerateOfferLetterCommand, OfferLetterDto>
    {
        public async Task<OfferLetterDto> Handle(GenerateOfferLetterCommand request, CancellationToken cancellationToken)
        {
            var candidate = await db.Candidates
                .Include(c => c.Vacancy).ThenInclude(v => v.EmploymentType)
                .FirstOrDefaultAsync(c => c.Id == request.CandidateId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateEntity), request.CandidateId);

            if (candidate.Status != "Offered")
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(candidate.Status),
                    $"An offer letter can only be generated for a candidate whose status is 'Offered' (current: '{candidate.Status}').")]);
            }

            var hasActiveOffer = await db.OfferLetters.AnyAsync(
                o => o.CandidateId == candidate.Id && o.Status != "Declined" && o.Status != "Withdrawn", cancellationToken);
            if (hasActiveOffer)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("OfferLetter",
                    "This candidate already has an active offer letter.")]);
            }

            var preparedBy = await db.Users.FirstAsync(u => u.Id == request.PreparedByUserId, cancellationToken);
            var generatedAt = DateTime.UtcNow;

            var pdfBytes = pdfGenerator.Generate(new OfferLetterPdfModel(
                $"{candidate.FirstName} {candidate.LastName}", candidate.Vacancy.Title, candidate.Vacancy.EmploymentType.Name,
                request.OfferedCTC, request.JoiningDate, $"{preparedBy.FirstName} {preparedBy.LastName}", generatedAt));

            await using var pdfStream = new MemoryStream(pdfBytes);
            var storedPath = await fileStorage.SaveAsync($"offers/{candidate.Id}", $"Offer_{candidate.CandidateCode}.pdf", pdfStream, cancellationToken);

            var offer = new OfferLetter
            {
                CandidateId = candidate.Id,
                VacancyId = candidate.VacancyId,
                OfferedCTC = request.OfferedCTC,
                JoiningDate = request.JoiningDate,
                Status = "PendingApproval",
                PreparedById = request.PreparedByUserId,
                GeneratedPdfPath = storedPath,
            };

            db.OfferLetters.Add(offer);

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                UserId = request.PreparedByUserId,
                Action = "GenerateOfferLetter",
                EntityName = nameof(OfferLetter),
                EntityId = candidate.CandidateCode,
            });

            db.OutboxMessages.Add(new OutboxMessage
            {
                EventType = "OfferGeneratedEvent",
                Payload = System.Text.Json.JsonSerializer.Serialize(new { CandidateId = candidate.Id, request.OfferedCTC, request.JoiningDate }),
            });

            await db.SaveChangesAsync(cancellationToken);

            return new OfferLetterDto(
                offer.Id, candidate.Id, $"{candidate.FirstName} {candidate.LastName}", candidate.VacancyId, candidate.Vacancy.Title,
                offer.OfferedCTC, offer.JoiningDate, offer.Status, $"{preparedBy.FirstName} {preparedBy.LastName}", null, null, offer.GeneratedPdfPath);
        }
    }
}
