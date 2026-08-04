using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.Candidates.Commands.AssignPipelineFlow;
using STEP.Application.Features.Candidates.Commands.RegisterCandidate;
using STEP.Application.Features.Candidates.Commands.UploadCandidateDocument;
using STEP.Application.Features.Candidates.Queries.GetCandidateById;
using STEP.Application.Features.Candidates.Queries.GetCandidates;

namespace STEP.Api.Controllers.v1
{
    [Authorize]
    public class CandidatesController(ISender mediator) : BaseApiController
    {
        [HttpGet]
        [Authorize(Policy = "Candidate.View")]
        public async Task<IActionResult> GetCandidates(
            [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null, [FromQuery] string? status = null, [FromQuery] int? vacancyId = null)
        {
            var result = await mediator.Send(new GetCandidatesQuery(pageIndex, pageSize, search, status, vacancyId));
            var meta = new PaginationMeta { PageIndex = pageIndex, PageSize = pageSize, TotalCount = result.TotalCount };
            return Ok(ApiResponse<object>.Ok(result.Items, "Candidates retrieved successfully", meta));
        }

        [HttpGet("{id:int}")]
        [Authorize(Policy = "Candidate.View")]
        public async Task<IActionResult> GetCandidateById(int id)
        {
            var candidate = await mediator.Send(new GetCandidateByIdQuery(id));
            return Ok(ApiResponse<object>.Ok(candidate, "Candidate retrieved successfully"));
        }

        [HttpPost]
        public async Task<IActionResult> RegisterCandidate([FromBody] RegisterCandidateCommand command)
        {
            var candidate = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(candidate, "Candidate registered successfully"));
        }

        [HttpPost("{id:int}/assign-pipeline-flow")]
        [Authorize(Policy = "Candidate.Approve")]
        public async Task<IActionResult> AssignPipelineFlow(int id, [FromBody] AssignPipelineFlowRequestBody body)
        {
            var candidate = await mediator.Send(new AssignPipelineFlowCommand(id, body.VacancyPipelineFlowId));
            return Ok(ApiResponse<object>.Ok(candidate, "Pipeline flow assigned successfully"));
        }

        [HttpPost("{id:int}/documents")]
        [RequestSizeLimit(15_000_000)]
        public async Task<IActionResult> UploadDocument(int id, [FromForm] string documentType, IFormFile file)
        {
            if (file is null || file.Length == 0)
            {
                return BadRequest(ApiResponse<object>.Fail("A file is required."));
            }

            await using var stream = file.OpenReadStream();
            var result = await mediator.Send(new UploadCandidateDocumentCommand(
                id, documentType, file.FileName, file.ContentType, file.Length, stream, CurrentUserId));

            return Ok(ApiResponse<object>.Ok(result, "Document uploaded successfully"));
        }
    }

    public record AssignPipelineFlowRequestBody(int VacancyPipelineFlowId);
}
