using System;
using System.Collections.Generic;
using STEP.Domain.Entities.Identity;

namespace STEP.Application.Common.Interfaces
{
    public record AccessTokenResult(string AccessToken, DateTime ExpiresAtUtc, string RefreshToken, DateTime RefreshExpiresAtUtc);

    /// <summary>
    /// Generates access tokens (JWT) and opaque refresh tokens. Implementations must never
    /// return the raw refresh token to a caller that persists it verbatim — only its hash is stored.
    /// </summary>
    public interface IJwtTokenService
    {
        AccessTokenResult GenerateTokens(User user, string roleName, IEnumerable<string> permissionCodes);

        string HashRefreshToken(string rawRefreshToken);
    }
}
