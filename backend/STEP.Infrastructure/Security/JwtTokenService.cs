using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Identity;

namespace STEP.Infrastructure.Security
{
    public class JwtTokenService(IConfiguration configuration) : IJwtTokenService
    {
        public AccessTokenResult GenerateTokens(User user, string roleName, IEnumerable<string> permissionCodes)
        {
            var secret = configuration["JWT_SECRET"]
                ?? throw new InvalidOperationException("JWT_SECRET is not configured.");
            var issuer = configuration["JWT_ISSUER"] ?? "STEP.Enterprise";
            var audience = configuration["JWT_AUDIENCE"] ?? "STEP.Users";
            var expiryMinutes = int.TryParse(configuration["JWT_EXPIRY_MINUTES"], out var m) ? m : 15;
            var refreshDays = int.TryParse(configuration["JWT_REFRESH_EXPIRY_DAYS"], out var d) ? d : 7;

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.GivenName, $"{user.FirstName} {user.LastName}"),
                new("employee_code", user.EmployeeCode),
                new(ClaimTypes.Role, roleName),
            };

            foreach (var permission in permissionCodes)
            {
                claims.Add(new Claim("permission", permission));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiresAtUtc = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAtUtc,
                signingCredentials: credentials);

            var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
            var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var refreshExpiresAtUtc = DateTime.UtcNow.AddDays(refreshDays);

            return new AccessTokenResult(accessToken, expiresAtUtc, refreshToken, refreshExpiresAtUtc);
        }

        public string HashRefreshToken(string rawRefreshToken)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawRefreshToken));
            return Convert.ToHexString(bytes);
        }
    }
}
