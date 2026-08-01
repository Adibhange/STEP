using System.Collections.Generic;
using ERMS.Domain.Entities.Staff;

namespace ERMS.Application.Common.Interfaces
{
    public interface IJwtProvider
    {
        (string AccessToken, string RefreshToken) GenerateTokens(User user, IEnumerable<string> roles, IEnumerable<string> permissions);
    }
}
