using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.MasterData.Queries.GetMasterData;
using STEP.Application.Features.MasterData.Commands.ToggleMasterDataStatus;

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

        [HttpPatch("{category}/{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(string category, int id)
        {
            var isActive = await mediator.Send(new ToggleMasterDataStatusCommand(id, category));
            var status = isActive ? "Active" : "Inactive";
            return Ok(ApiResponse<object>.Ok(new { id, category, isActive, status }, $"Master record {id} status set to {status}"));
        }
    }
}
