using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Auth.Common;
using STEP.Domain.Entities.Identity;

namespace STEP.Application.Features.Auth.RefreshToken
{
    public class RefreshTokenCommandHandler(IApplicationDbContext db, IJwtTokenService jwt)
        : IRequestHandler<RefreshTokenCommand, AuthResultDto>
    {
        public async Task<AuthResultDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            var incomingHash = jwt.HashRefreshToken(request.RefreshToken);

            var existing = await db.UserRefreshTokens
                .Include(t => t.User).ThenInclude(u => u.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(t => t.TokenHash == incomingHash, cancellationToken);

            if (existing == null || !existing.IsActive || !existing.User.IsActive)
            {
                throw new AuthenticationFailedException("Refresh token is invalid, expired, or has already been used.");
            }

            var user = existing.User;
            var permissionCodes = user.Role.RolePermissions.Select(rp => rp.Permission.Code).Distinct().ToList();
            var tokens = jwt.GenerateTokens(user, user.Role.Name, permissionCodes);
            var newHash = jwt.HashRefreshToken(tokens.RefreshToken);

            // Rotation: revoke the presented token and chain it to its replacement.
            existing.RevokedAt = DateTime.UtcNow;
            existing.ReplacedByTokenHash = newHash;

            db.UserRefreshTokens.Add(new UserRefreshToken
            {
                UserId = user.Id,
                TokenHash = newHash,
                ExpiresAt = tokens.RefreshExpiresAtUtc,
                CreatedByIp = request.IpAddress
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
