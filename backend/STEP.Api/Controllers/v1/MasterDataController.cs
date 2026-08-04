using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.MasterData.Queries.GetMasterData;

namespace STEP.Api.Controllers.v1
{
    /// <summary>
    /// Serves the five Phase 1 taxonomies backing the frontend Settings module
    /// (src/features/settings/mock/master.mock.ts): roles, departments, hiringLocations,
    /// testLocations, employmentTypes.
    /// </summary>
    [Authorize]
    public class MasterDataController(ISender mediator) : BaseApiController
    {
        [HttpGet("{category}")]
        public async Task<IActionResult> GetByCategory(string category)
        {
            var items = await mediator.Send(new GetMasterDataQuery(category));
            return Ok(ApiResponse<object>.Ok(items, $"Master data '{category}' retrieved successfully"));
        }
    }
}
