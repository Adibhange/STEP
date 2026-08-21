using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.V2.Blueprints;

namespace STEP.Api.Controllers
{
    [Route("api/v2/assessment-templates")]
    [Route("api/v1/assessment-templates")]
    [Route("api/assessment-templates")]
    [Authorize]
    public class AssessmentTemplatesController(ISender mediator) : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetTemplates()
        {
            var result = await mediator.Send(new GetAssessmentTemplatesQuery());
            return Ok(ApiResponse<object>.Ok(result, "Assessment templates retrieved successfully"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateTemplate([FromBody] SaveAssessmentTemplateCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(result, "Assessment template created successfully"));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateTemplate(int id, [FromBody] SaveAssessmentTemplateCommand command)
        {
            var updatedCommand = command with { Id = id };
            var result = await mediator.Send(updatedCommand);
            return Ok(ApiResponse<object>.Ok(result, "Assessment template updated successfully"));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            var result = await mediator.Send(new DeleteAssessmentTemplateCommand(id));
            return Ok(ApiResponse<object>.Ok(result, "Assessment template deleted successfully"));
        }
    }
}

