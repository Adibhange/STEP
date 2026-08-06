using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Identity;

namespace STEP.Application.Features.Users.Commands.ChangeUserPassword
{
    public record ChangeUserPasswordCommand(
        int UserId,
        string CurrentPassword,
        string NewPassword
    ) : IRequest<bool>;

    public class ChangeUserPasswordCommandHandler(IApplicationDbContext db, IPasswordHasher hasher)
        : IRequestHandler<ChangeUserPasswordCommand, bool>
    {
        public async Task<bool> Handle(ChangeUserPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await db.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
                ?? throw new NotFoundException(nameof(User), request.UserId);

            if (!hasher.Verify(request.CurrentPassword, user.PasswordHash))
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("CurrentPassword", "Incorrect current password.")]);
            }

            user.PasswordHash = hasher.Hash(request.NewPassword);
            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
