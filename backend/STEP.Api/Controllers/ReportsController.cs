using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.Reports.Queries.GetRecruitmentFunnel;

namespace STEP.Api.Controllers
{
    [Authorize(Policy = "Report.View")]
    public class ReportsController(ISender mediator) : BaseApiController
    {
        [HttpGet("recruitment-funnel")]
        public async Task<IActionResult> GetRecruitmentFunnel()
        {
            var funnel = await mediator.Send(new GetRecruitmentFunnelQuery());
            return Ok(ApiResponse<object>.Ok(funnel, "Recruitment funnel retrieved successfully"));
        }
    }
}

