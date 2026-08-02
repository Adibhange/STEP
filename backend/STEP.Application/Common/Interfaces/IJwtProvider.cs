using System.Collections.Generic;
using STEP.Domain.Entities.Staff;

namespace STEP.Application.Common.Interfaces
{
    public interface IJwtProvider
    {
        (string AccessToken, string RefreshToken) GenerateTokens(User user, IEnumerable<string> roles, IEnumerable<string> permissions);
    }
}
