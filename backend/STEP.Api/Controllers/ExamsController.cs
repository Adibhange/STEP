using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Models;
using STEP.Application.Features.Exams.Commands.EvaluateCandidateAnswer;
using STEP.Application.Features.Exams.Commands.PublishAssessmentResult;
using STEP.Application.Features.Exams.Commands.ReportExamViolation;
using STEP.Application.Features.Exams.Commands.SaveExamAnswer;
using STEP.Application.Features.Exams.Commands.StartExamSession;
using STEP.Application.Features.Exams.Commands.SubmitExam;
using STEP.Application.Features.Exams.Queries.GetExamEvaluationView;
using STEP.Application.Features.Exams.Queries.ResumeExamSession;
using STEP.Application.Features.V2.Exams.Commands.GenerateTempExamPass;
using STEP.Application.Features.V2.Exams.Commands.PublishAssessmentResultV2;
using STEP.Application.Features.V2.Exams.Commands.SaveExamAnswerBatch;

namespace STEP.Api.Controllers
{
    /// <summary>
    /// Unified Exam & Assessment Controller mapped to /api/v2/exams, /api/v1/exams, and /api/exams.
    /// </summary>
    public class ExamsController(ISender mediator) : BaseApiController
    {
        [HttpPost("start")]
        [AllowAnonymous]
        public async Task<IActionResult> Start([FromBody] StartExamSessionRequestBody body)
        {
            var testSource = string.IsNullOrWhiteSpace(body.TestSource) ? "Home" : body.TestSource;
            if (testSource.Equals("Online", System.StringComparison.OrdinalIgnoreCase)) testSource = "Home";
            if (testSource.Equals("In Office", System.StringComparison.OrdinalIgnoreCase)) testSource = "Office";

            var result = await mediator.Send(new StartExamSessionCommand(
                body.CandidateCode, body.Passcode, testSource,
                HttpContext.Connection.RemoteIpAddress?.ToString(), Request.Headers.UserAgent.ToString(),
                body.RoundNumber));
            return Ok(ApiResponse<object>.Ok(result, "Assessment session ready"));
        }

        [HttpGet("resume/{sessionToken}")]
        [AllowAnonymous]
        public async Task<IActionResult> Resume(string sessionToken)
        {
            var result = await mediator.Send(new ResumeExamSessionQuery(sessionToken));
            return Ok(ApiResponse<object>.Ok(result, "Assessment session resumed"));
        }

        [HttpPost("answers")]
        [AllowAnonymous]
        public async Task<IActionResult> SaveAnswer([FromBody] SaveExamAnswerCommand command)
        {
            await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(new { }, "Answer saved"));
        }

        [HttpPost("batch-answers")]
        [HttpPost("answers/batch")]
        [HttpPost("{sessionToken}/batch-answers")]
        [AllowAnonymous]
        public async Task<IActionResult> SaveAnswerBatch([FromBody] SaveExamAnswerBatchCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(result, "Offline answers synced and saved successfully"));
        }

        [HttpPost("submit")]
        [HttpPost("{sessionToken}/submit")]
        [AllowAnonymous]
        public async Task<IActionResult> Submit([FromRoute] string? sessionToken, [FromBody] SubmitExamRequestBody? body)
        {
            var token = !string.IsNullOrWhiteSpace(sessionToken) ? sessionToken : body?.SessionToken;
            if (string.IsNullOrWhiteSpace(token))
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("SessionToken", "Session token is required to submit.")]);
            }
            var result = await mediator.Send(new SubmitExamCommand(token));
            return Ok(ApiResponse<object>.Ok(result, "Assessment submitted successfully"));
        }

        [HttpPost("violations")]
        [AllowAnonymous]
        public async Task<IActionResult> ReportViolation([FromBody] ReportExamViolationRequestBody body)
        {
            var result = await mediator.Send(new ReportExamViolationCommand(body.SessionToken, body.ViolationType));
            return Ok(ApiResponse<object>.Ok(result, "Violation recorded"));
        }

        [HttpGet("{sessionId:int}/evaluation")]
        [Authorize(Policy = "Exam.Manage")]
        public async Task<IActionResult> GetEvaluation(int sessionId)
        {
            var result = await mediator.Send(new GetExamEvaluationViewQuery(sessionId));
            return Ok(ApiResponse<object>.Ok(result, "Evaluation view retrieved"));
        }

        [HttpPost("evaluate")]
        [Authorize(Policy = "Exam.Manage")]
        public async Task<IActionResult> EvaluateAnswer([FromBody] EvaluateAnswerRequestBody body)
        {
            var evaluatedBy = CurrentUserId ?? throw new System.UnauthorizedAccessException("Unable to resolve the current user.");
            await mediator.Send(new EvaluateCandidateAnswerCommand(body.CandidateExamAnswerId, body.MarksObtained, body.EvaluatorRemarks, evaluatedBy));
            return Ok(ApiResponse<object>.Ok(new { }, "Answer evaluated"));
        }

        [HttpPost("{sessionId:int}/publish")]
        [Authorize(Policy = "Exam.Manage")]
        public async Task<IActionResult> Publish(int sessionId, [FromBody] PublishRequestBody body)
        {
            var publishedBy = CurrentUserId ?? throw new System.UnauthorizedAccessException("Unable to resolve the current user.");
            var result = await mediator.Send(new PublishAssessmentResultCommand(sessionId, body.Remarks, publishedBy));
            return Ok(ApiResponse<object>.Ok(result, "Assessment result published and locked"));
        }

        [HttpPost("temp-pass")]
        [Authorize(Policy = "Candidate.Manage")]
        public async Task<IActionResult> GenerateTempPass([FromBody] GenerateTempExamPassCommand command)
        {
            var pass = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(pass, "Temporary exam pass generated successfully"));
        }

        [HttpPost("{sessionId:int}/auto-grade-publish")]
        [Authorize(Policy = "Exam.Manage")]
        public async Task<IActionResult> AutoGradeAndPublish(int sessionId, [FromBody] AutoGradePublishRequestBody? body)
        {
            var evaluatorId = CurrentUserId;
            var result = await mediator.Send(new PublishAssessmentResultV2Command(sessionId, body?.Remarks, evaluatorId));
            return Ok(ApiResponse<object>.Ok(result, "Assessment auto-evaluated and published"));
        }
    }

    public record StartExamSessionRequestBody(string CandidateCode, string Passcode, string? TestSource, int? RoundNumber = null);
    public record SubmitExamRequestBody(string? SessionToken, string? Reason = null);
    public record ReportExamViolationRequestBody(string SessionToken, string ViolationType);
    public record EvaluateAnswerRequestBody(int CandidateExamAnswerId, decimal MarksObtained, string? EvaluatorRemarks);
    public record PublishRequestBody(string? Remarks);
    public record AutoGradePublishRequestBody(string? Remarks);
}

