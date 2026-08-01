using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ERMS.Application.Common.Interfaces;
using ERMS.Domain.Entities.Staff;
using Microsoft.IdentityModel.Tokens;

namespace ERMS.Infrastructure.Security
{
    public class JwtProvider : IJwtProvider
    {
        private const string SecretKey = "ERMS_SUPER_SECRET_SECURITY_KEY_FOR_ENTERPRISE_JWT_TOKEN_100_BITS";

        public (string AccessToken, string RefreshToken) GenerateTokens(User user, IEnumerable<string> roles, IEnumerable<string> permissions)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.GivenName, $"{user.FirstName} {user.LastName}"),
                new Claim("EmployeeCode", user.EmployeeCode)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            foreach (var perm in permissions)
            {
                claims.Add(new Claim("Permission", perm));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: "ERMS.Enterprise",
                audience: "ERMS.Users",
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds
            );

            var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
            var refreshToken = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");

            return (accessToken, refreshToken);
        }
    }
}
