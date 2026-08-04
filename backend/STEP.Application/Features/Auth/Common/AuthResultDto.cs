using System;
using System.Collections.Generic;

namespace STEP.Application.Features.Auth.Common
{
    public record UserSummaryDto(
        int Id,
        string EmployeeCode,
        string FirstName,
        string LastName,
        string Email,
        string Role,
        IReadOnlyList<string> Permissions);

    public record AuthResultDto(
        string AccessToken,
        DateTime ExpiresAtUtc,
        string RefreshToken,
        UserSummaryDto User);
}
