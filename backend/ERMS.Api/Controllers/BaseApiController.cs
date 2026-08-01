using Microsoft.AspNetCore.Mvc;

namespace ERMS.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
    }
}
