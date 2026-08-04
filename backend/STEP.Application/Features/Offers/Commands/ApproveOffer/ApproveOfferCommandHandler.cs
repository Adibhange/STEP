using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Interview;
using STEP.Domain.Entities.Notification;

namespace STEP.Application.Features.Offers.Commands.ApproveOffer
{
    public class ApproveOfferCommandHandler(IApplicationDbContext db, IPasswordHasher hasher) : IRequestHandler<ApproveOfferCommand, bool>
    {
        public async Task<bool> Handle(ApproveOfferCommand request, CancellationToken cancellationToken)
        {
            var offer = await db.OfferLetters.FirstOrDefaultAsync(o => o.Id == request.OfferLetterId, cancellationToken)
                ?? throw new NotFoundException(nameof(OfferLetter), request.OfferLetterId);

            if (offer.Status != "PendingApproval")
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(offer.Status),
                    $"Only a PendingApproval offer can be approved (current status: '{offer.Status}').")]);
            }

            var director = await db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == request.DirectorUserId, cancellationToken)
                ?? throw new AuthenticationFailedException("Director user not found.");

            if (director.Role.Name != "Director")
            {
                throw new AuthenticationFailedException("Only a Director may approve offer letters.");
            }

            if (director.PinHash == null || !hasher.Verify(request.DirectorPin, director.PinHash))
            {
                throw new AuthenticationFailedException("Invalid Director security PIN.");
            }

            offer.Status = "Approved";
            offer.ApprovedById = director.Id;
            offer.ApprovedAt = DateTime.UtcNow;

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                UserId = director.Id,
                Action = "ApproveOffer",
                EntityName = nameof(OfferLetter),
                EntityId = offer.Id.ToString(),
            });

            db.OutboxMessages.Add(new OutboxMessage
            {
                EventType = "OfferApprovedEvent",
                Payload = System.Text.Json.JsonSerializer.Serialize(new { OfferLetterId = offer.Id, offer.CandidateId }),
            });

            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
