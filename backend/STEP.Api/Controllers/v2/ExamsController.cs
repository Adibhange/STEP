using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.V2.Exams.Commands.GenerateTempExamPass;
using STEP.Application.Features.V2.Exams.Commands.PublishAssessmentResultV2;
using STEP.Application.Features.V2.Exams.Commands.SaveExamAnswerBatch;

namespace STEP.Api.Controllers.v2
{
    /// <summary>
    /// V2 Autonomous Exam & Assessment endpoints.
    /// Batch answer syncing is open to candidates with a valid SessionToken.
    /// Spot pass generation and auto-grade publish require staff policies.
    /// </summary>
    public class ExamsController(ISender mediator) : BaseApiControllerV2
    {
        /// <summary>
        /// Generates a 24-hour instant spot exam pass for walk-ins and spot candidates.
        /// </summary>
        [HttpPost("temp-pass")]
        [Authorize(Policy = "Candidate.Manage")]
        public async Task<IActionResult> GenerateTempPass([FromBody] GenerateTempExamPassCommand command)
        {
            var pass = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(pass, "Temporary exam pass generated successfully"));
        }

        /// <summary>
        /// High-throughput batch answer sync endpoint for offline-reconnected candidate exam sessions.
        /// Buffers and flushes answers sequentially with server timestamping.
        /// </summary>
        [HttpPost("batch-answers")]
        public async Task<IActionResult> SaveAnswerBatch([FromBody] SaveExamAnswerBatchCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(result, "Offline answers synced and saved successfully"));
        }

        /// <summary>
        /// Zero-Touch Screening: Auto-grades objective questions, computes score against profile cutoff,
        /// and advances passing candidates automatically to Interview Scheduled.
        /// </summary>
        [HttpPost("{sessionId:int}/auto-grade-publish")]
        [Authorize(Policy = "Exam.Manage")]
        public async Task<IActionResult> AutoGradeAndPublish(int sessionId, [FromBody] AutoGradePublishRequestBody? body)
        {
            var evaluatorId = CurrentUserId;
            var result = await mediator.Send(new PublishAssessmentResultV2Command(sessionId, body?.Remarks, evaluatorId));
            return Ok(ApiResponse<object>.Ok(result, "Assessment auto-evaluated and published"));
        }
    }

    public record AutoGradePublishRequestBody(string? Remarks);
}
