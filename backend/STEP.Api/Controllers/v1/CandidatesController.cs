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
        [HttpPost("{id:int}/evaluate-stage")]
        [Authorize(Policy = "Candidate.Approve")]
        public async Task<IActionResult> EvaluateStage(int id, [FromBody] EvaluateStageRequestBody body)
        {
            var candidate = await mediator.Send(new STEP.Application.Features.Candidates.Commands.EvaluateCandidateStage.EvaluateCandidateStageCommand(
                id, body.RoundNumber, body.Passed, body.Remarks));
            return Ok(ApiResponse<object>.Ok(candidate, "Stage evaluated successfully"));
        }

        [HttpPost("{id:int}/assign-evaluator")]
        [Authorize(Policy = "Candidate.Approve")]
        public async Task<IActionResult> AssignEvaluator(int id, [FromBody] AssignEvaluatorRequestBody body)
        {
            var candidate = await mediator.Send(new STEP.Application.Features.Candidates.Commands.AssignEvaluator.AssignEvaluatorCommand(
                id, body.RoundNumber, body.EvaluatorUserId));
            return Ok(ApiResponse<object>.Ok(candidate, "Evaluator assigned successfully"));
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = "Candidate.Approve")]
        public async Task<IActionResult> UpdateCandidate(int id, [FromBody] UpdateCandidateRequestBody body)
        {
            var candidate = await mediator.Send(new STEP.Application.Features.Candidates.Commands.UpdateCandidate.UpdateCandidateCommand(
                id, body.FirstName, body.LastName, body.Email, body.Phone, body.CurrentLocation, body.HighestQualification,
                body.TotalExperienceYears, body.CurrentCTC, body.ExpectedCTC, body.NoticePeriodDays));
            return Ok(ApiResponse<object>.Ok(candidate, "Candidate profile updated successfully"));
        }

        [HttpDelete("{id:int}/documents/{docId:int}")]
        public async Task<IActionResult> DeleteDocument(int id, int docId)
        {
            await mediator.Send(new STEP.Application.Features.Candidates.Commands.DeleteCandidateDocument.DeleteCandidateDocumentCommand(id, docId));
            return Ok(ApiResponse<object>.Ok(new { id, docId }, "Document deleted successfully"));
        }

        [HttpGet("{id:int}/documents/{docId:int}/download")]
        public async Task<IActionResult> DownloadDocument(int id, int docId)
        {
            var docFile = await mediator.Send(new STEP.Application.Features.Candidates.Queries.GetCandidateDocumentFile.GetCandidateDocumentFileQuery(id, docId));
            return File(docFile.FileBytes, docFile.ContentType, docFile.FileName);
        }

        [HttpPost("{id:int}/schedule-test")]
        public async Task<IActionResult> ScheduleTest(int id, [FromBody] ScheduleTestRequestBody body)
        {
            var candidate = await mediator.Send(new STEP.Application.Features.Candidates.Commands.ScheduleCandidateTest.ScheduleCandidateTestCommand(
                id, body.TestMode, body.ScheduledDate, body.StartTime, body.EndTime, body.Passcode));
            return Ok(ApiResponse<object>.Ok(candidate, "Test scheduled successfully"));
        }
    }

    public record AssignPipelineFlowRequestBody(int VacancyPipelineFlowId);
    public record EvaluateStageRequestBody(int RoundNumber, bool Passed, string? Remarks);
    public record AssignEvaluatorRequestBody(int RoundNumber, int EvaluatorUserId);
    public record ScheduleTestRequestBody(string TestMode, string ScheduledDate, string StartTime, string EndTime, string? Passcode);
    public record UpdateCandidateRequestBody(
        string FirstName, string LastName, string Email, string Phone, string? CurrentLocation,
        string? HighestQualification, decimal TotalExperienceYears, decimal CurrentCTC, decimal ExpectedCTC, int NoticePeriodDays);
}
