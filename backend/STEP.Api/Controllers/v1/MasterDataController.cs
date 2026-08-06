using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.MasterData.Queries.GetMasterData;
using STEP.Application.Features.MasterData.Commands.CreateMasterData;
using STEP.Application.Features.MasterData.Commands.UpdateMasterData;
using STEP.Application.Features.MasterData.Commands.ToggleMasterDataStatus;
using STEP.Application.Features.MasterData.Commands.DeleteMasterData;

namespace STEP.Api.Controllers.v1
{
    public record CreateMasterDataRequest(string Name, string Code, string? Description, bool IsActive = true);
    public record UpdateMasterDataRequest(string Name, string Code, string? Description, bool IsActive);

    /// <summary>
    /// Serves the Phase 1 master taxonomies backing the frontend Settings module:
    /// roles, departments, hiringLocations, testLocations, employmentTypes, experienceLevels.
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

        [HttpPost("{category}")]
        [Authorize(Policy = "MasterData.Manage")]
        public async Task<IActionResult> CreateRecord(string category, [FromBody] CreateMasterDataRequest request)
        {
            var command = new CreateMasterDataCommand(category, request.Name, request.Code, request.Description, request.IsActive);
            var result = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(result, $"Master record created successfully"));
        }

        [HttpPut("{category}/{id}")]
        [Authorize(Policy = "MasterData.Manage")]
        public async Task<IActionResult> UpdateRecord(string category, int id, [FromBody] UpdateMasterDataRequest request)
        {
            var command = new UpdateMasterDataCommand(id, category, request.Name, request.Code, request.Description, request.IsActive);
            var result = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(result, $"Master record updated successfully"));
        }

        [HttpPatch("{category}/{id}/toggle-status")]
        [Authorize(Policy = "MasterData.Manage")]
        public async Task<IActionResult> ToggleStatus(string category, int id)
        {
            var isActive = await mediator.Send(new ToggleMasterDataStatusCommand(id, category));
            var status = isActive ? "Active" : "Inactive";
            return Ok(ApiResponse<object>.Ok(new { id, category, isActive, status }, $"Master record {id} status set to {status}"));
        }

        [HttpDelete("{category}/{id}")]
        [Authorize(Policy = "MasterData.Manage")]
        public async Task<IActionResult> DeleteRecord(string category, int id)
        {
            await mediator.Send(new DeleteMasterDataCommand(id, category));
            return Ok(ApiResponse<object>.Ok(new { id, category }, $"Master record {id} deleted successfully"));
        }
    }
}
