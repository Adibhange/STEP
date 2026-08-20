using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Identity;

namespace STEP.Application.Features.Users.Commands.ChangeUserPin
{
    public record ChangeUserPinCommand(
        int UserId,
        string CurrentPin,
        string NewPin
    ) : IRequest<bool>;

    public class ChangeUserPinCommandHandler(IApplicationDbContext db, IPasswordHasher hasher)
        : IRequestHandler<ChangeUserPinCommand, bool>
    {
        public async Task<bool> Handle(ChangeUserPinCommand request, CancellationToken cancellationToken)
        {
            var user = await db.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
                ?? throw new NotFoundException(nameof(User), request.UserId);

            if (!string.IsNullOrEmpty(user.PinHash) && !hasher.Verify(request.CurrentPin, user.PinHash))
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("CurrentPin", "Incorrect current 4-digit PIN.")]);
            }

            if (string.IsNullOrWhiteSpace(request.NewPin) || request.NewPin.Length != 4)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("NewPin", "New PIN must be exactly 4 numeric digits.")]);
            }

            user.PinHash = hasher.Hash(request.NewPin);
            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
