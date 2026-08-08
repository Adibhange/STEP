using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Auth.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Identity;

namespace STEP.Application.Features.Auth.DirectorPin
{
    public class DirectorPinLoginCommandHandler(IApplicationDbContext db, IPasswordHasher hasher, IJwtTokenService jwt)
        : IRequestHandler<DirectorPinLoginCommand, AuthResultDto>
    {
        public async Task<AuthResultDto> Handle(DirectorPinLoginCommand request, CancellationToken cancellationToken)
        {
            var directors = await db.Users
                .Include(u => u.Role)
                .Where(u => u.Role.Name == "Director" && u.IsActive && u.PinHash != null)
                .ToListAsync(cancellationToken);

            var user = directors.FirstOrDefault(u => hasher.Verify(request.Pin, u.PinHash!));

            if (user == null)
            {
                throw new AuthenticationFailedException("Invalid Director security PIN.");
            }

            user.LastLoginAt = DateTime.UtcNow;

            var permissionCodes = await db.RolePermissions
                .Where(rp => rp.RoleId == user.RoleId)
                .Select(rp => rp.Permission.Code)
                .Distinct()
                .ToListAsync(cancellationToken);
            var tokens = jwt.GenerateTokens(user, user.Role.Name, permissionCodes);

            db.UserRefreshTokens.Add(new UserRefreshToken
            {
                UserId = user.Id,
                TokenHash = jwt.HashRefreshToken(tokens.RefreshToken),
                ExpiresAt = tokens.RefreshExpiresAtUtc,
                CreatedByIp = request.IpAddress
            });

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                UserId = user.Id,
                Action = "DirectorPinLogin",
                EntityName = nameof(User),
                EntityId = user.Id.ToString(),
                IpAddress = request.IpAddress
            });

            await db.SaveChangesAsync(cancellationToken);

            return new AuthResultDto(
                tokens.AccessToken,
                tokens.ExpiresAtUtc,
                tokens.RefreshToken,
                new UserSummaryDto(user.Id, user.EmployeeCode, user.FirstName, user.LastName, user.Email, user.Role.Name, permissionCodes));
        }
    }
}
