using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace STEP.Api.Controllers
{
    [ApiController]
    [Route("api/v2/[controller]")]
    public abstract class BaseApiControllerV2 : ControllerBase
    {
        /// <summary>The authenticated user's Id from the JWT's NameIdentifier claim, or null if unauthenticated.</summary>
        protected int? CurrentUserId
        {
            get
            {
                var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
                return int.TryParse(raw, out var id) ? id : null;
            }
        }
    }
}
