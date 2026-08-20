using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace STEP.Api.Controllers
{
    /// <summary>
    /// Base API Controller mapping all endpoints simultaneously to /api/v2/, /api/v1/, and /api/
    /// guaranteeing unified URL structure and complete backward compatibility.
    /// </summary>
    [ApiController]
    [Route("api/v2/[controller]")]
    [Route("api/v1/[controller]")]
    [Route("api/[controller]")]
    public abstract class BaseApiController : ControllerBase
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
