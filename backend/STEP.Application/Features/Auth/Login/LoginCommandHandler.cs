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
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

            if (user != null && !user.IsActive)
            {
                throw new AuthenticationFailedException("This account has been deactivated. Contact your administrator.");
            }

            if (user != null && user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
            {
                var remainingMinutes = Math.Max(1, (int)Math.Ceiling((user.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes));
                throw new AuthenticationFailedException($"Account is locked due to 5 failed login attempts. Please try again in {remainingMinutes} minute{(remainingMinutes > 1 ? "s" : "")}.");
            }

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

            user.AccessFailedCount = 0;
            user.LockoutEnd = null;
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
