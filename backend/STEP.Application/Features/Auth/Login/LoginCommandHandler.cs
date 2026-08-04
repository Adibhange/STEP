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

namespace STEP.Application.Features.Auth.Login
{
    public class LoginCommandHandler(IApplicationDbContext db, IPasswordHasher hasher, IJwtTokenService jwt)
        : IRequestHandler<LoginCommand, AuthResultDto>
    {
        private const int MaxFailedAttempts = 5;
        private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

        public async Task<AuthResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await db.Users
                .Include(u => u.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

            if (user == null || !hasher.Verify(request.Password, user.PasswordHash))
            {
                if (user != null)
                {
                    user.AccessFailedCount++;
                    if (user.AccessFailedCount >= MaxFailedAttempts)
                    {
                        user.LockoutEnd = DateTime.UtcNow.Add(LockoutDuration);
                    }
                    await db.SaveChangesAsync(cancellationToken);
                }

                throw new AuthenticationFailedException("Invalid email or password.");
            }

            if (!user.IsActive)
            {
                throw new AuthenticationFailedException("This account has been deactivated. Contact your administrator.");
            }

            if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
            {
                throw new AuthenticationFailedException($"Account locked until {user.LockoutEnd.Value:u} due to repeated failed sign-in attempts.");
            }

            user.AccessFailedCount = 0;
            user.LockoutEnd = null;
            user.LastLoginAt = DateTime.UtcNow;

            var permissionCodes = user.Role.RolePermissions.Select(rp => rp.Permission.Code).Distinct().ToList();
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
                Action = "Login",
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
