using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.Exams.Commands.EvaluateCandidateAnswer;
using STEP.Application.Features.Exams.Commands.PublishAssessmentResult;
using STEP.Application.Features.Exams.Commands.SaveExamAnswer;
using STEP.Application.Features.Exams.Commands.StartExamSession;
using STEP.Application.Features.Exams.Commands.SubmitExam;
using STEP.Application.Features.Exams.Queries.GetExamEvaluationView;
using STEP.Application.Features.Exams.Queries.ResumeExamSession;

namespace STEP.Api.Controllers.v1
{
    /// <summary>
    /// Candidate-facing endpoints (start/resume/answer/submit) are intentionally anonymous —
    /// candidates authenticate with CandidateCode + Passcode, not a staff JWT. Evaluation/publish
    /// endpoints are staff-only.
    /// </summary>
    public class ExamsController(ISender mediator) : BaseApiController
    {
        [HttpPost("start")]
        public async Task<IActionResult> Start([FromBody] StartExamSessionRequestBody body)
        {
            var testSource = string.IsNullOrWhiteSpace(body.TestSource) ? "Home" : body.TestSource;
            var result = await mediator.Send(new StartExamSessionCommand(
                body.CandidateCode, body.Passcode, testSource,
                HttpContext.Connection.RemoteIpAddress?.ToString(), Request.Headers.UserAgent.ToString()));
            return Ok(ApiResponse<object>.Ok(result, "Assessment session ready"));
        }

        [HttpGet("resume/{sessionToken}")]
        public async Task<IActionResult> Resume(string sessionToken)
        {
            var result = await mediator.Send(new ResumeExamSessionQuery(sessionToken));
            return Ok(ApiResponse<object>.Ok(result, "Assessment session resumed"));
        }

        [HttpPost("answers")]
        public async Task<IActionResult> SaveAnswer([FromBody] SaveExamAnswerCommand command)
        {
            await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(new { }, "Answer saved"));
        }

        [HttpPost("submit")]
        public async Task<IActionResult> Submit([FromBody] SubmitExamRequestBody body)
        {
            var result = await mediator.Send(new SubmitExamCommand(body.SessionToken));
            return Ok(ApiResponse<object>.Ok(result, "Assessment submitted successfully"));
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
    }

    public record StartExamSessionRequestBody(string CandidateCode, string Passcode, string? TestSource);
    public record SubmitExamRequestBody(string SessionToken);
    public record EvaluateAnswerRequestBody(int CandidateExamAnswerId, decimal MarksObtained, string? EvaluatorRemarks);
    public record PublishRequestBody(string? Remarks);
}
