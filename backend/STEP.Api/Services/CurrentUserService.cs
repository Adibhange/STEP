using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using STEP.Application.Common.Interfaces;

namespace STEP.Api.Services
{
    public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
    {
        public int? UserId
        {
            get
            {
                var raw = httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                return int.TryParse(raw, out var id) ? id : null;
            }
        }

        public string? Role => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
    }
}
