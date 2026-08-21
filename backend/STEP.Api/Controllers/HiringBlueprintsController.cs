using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.V2.Blueprints;

namespace STEP.Api.Controllers
{
    [Route("api/v2/hiring-blueprints")]
    [Route("api/v1/hiring-blueprints")]
    [Route("api/hiring-blueprints")]
    [Authorize]
    public class HiringBlueprintsController(ISender mediator) : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetBlueprints()
        {
            var result = await mediator.Send(new GetAssessmentTemplatesQuery());
            return Ok(ApiResponse<object>.Ok(result, "Assessment blueprints retrieved successfully"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateBlueprint([FromBody] SaveAssessmentTemplateCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(result, "Assessment blueprint created successfully"));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateBlueprint(int id, [FromBody] SaveAssessmentTemplateCommand command)
        {
            var updatedCommand = command with { Id = id };
            var result = await mediator.Send(updatedCommand);
            return Ok(ApiResponse<object>.Ok(result, "Assessment blueprint updated successfully"));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteBlueprint(int id)
        {
            var result = await mediator.Send(new DeleteAssessmentTemplateCommand(id));
            return Ok(ApiResponse<object>.Ok(result, "Assessment blueprint deleted successfully"));
        }
    }
}

