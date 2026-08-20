using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Features.V2.Blueprints;

namespace STEP.Api.Controllers.v2
{
    [Route("api/v2/hiring-blueprints")]
    [Route("api/v1/hiring-blueprints")]
    [Route("api/hiring-blueprints")]
    [Authorize]
    public class HiringBlueprintsController(ISender mediator) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<List<AssessmentTemplateDto>>> GetBlueprints()
        {
            var result = await mediator.Send(new GetAssessmentTemplatesQuery());
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<AssessmentTemplateDto>> CreateBlueprint([FromBody] SaveAssessmentTemplateCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<AssessmentTemplateDto>> UpdateBlueprint(int id, [FromBody] SaveAssessmentTemplateCommand command)
        {
            var updatedCommand = command with { Id = id };
            var result = await mediator.Send(updatedCommand);
            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<bool>> DeleteBlueprint(int id)
        {
            var result = await mediator.Send(new DeleteAssessmentTemplateCommand(id));
            return Ok(result);
        }
    }
}
