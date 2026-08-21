using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.Interviews.Commands.PublishInterviewResult;
using STEP.Application.Features.Interviews.Commands.ScheduleInterview;
using STEP.Application.Features.Interviews.Commands.SubmitInterviewFeedback;
using STEP.Application.Features.Interviews.Queries.GetInterviewById;

namespace STEP.Api.Controllers
{
    [Authorize(Policy = "Candidate.Approve")]
    public class InterviewsController(ISender mediator) : BaseApiController
    {
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await mediator.Send(new GetInterviewByIdQuery(id));
            return Ok(ApiResponse<object>.Ok(result, "Interview retrieved successfully"));
        }

        [HttpPost("schedule")]
        public async Task<IActionResult> Schedule([FromBody] ScheduleInterviewCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(result, "Interview scheduled successfully"));
        }

        [HttpPost("feedback")]
        public async Task<IActionResult> SubmitFeedback([FromBody] SubmitInterviewFeedbackRequestBody body)
        {
            var panelistUserId = CurrentUserId ?? throw new System.UnauthorizedAccessException("Unable to resolve the current user.");
            await mediator.Send(new SubmitInterviewFeedbackCommand(
                body.InterviewId, panelistUserId, body.TechnicalRating, body.CommunicationRating, body.ProblemSolvingRating,
                body.CulturalFitRating, body.Strengths, body.Weaknesses, body.Recommendation, body.Comments));
            return Ok(ApiResponse<object>.Ok(new { }, "Interview scorecard submitted successfully"));
        }

        [HttpPost("{id:int}/publish")]
        public async Task<IActionResult> Publish(int id, [FromBody] PublishInterviewRequestBody body)
        {
            var publishedBy = CurrentUserId ?? throw new System.UnauthorizedAccessException("Unable to resolve the current user.");
            var result = await mediator.Send(new PublishInterviewResultCommand(id, body.Passed, body.Remarks, publishedBy));
            return Ok(ApiResponse<object>.Ok(result, "Interview result published successfully"));
        }
    }

    public record PublishInterviewRequestBody(bool Passed, string? Remarks);

    /// <summary>Same shape as SubmitInterviewFeedbackCommand minus PanelistUserId â€” that's derived
    /// server-side from the JWT, never trusted from the client (mirrors Offers.Approve/Interviews.Publish).</summary>
    public record SubmitInterviewFeedbackRequestBody(
        int InterviewId,
        int TechnicalRating,
        int CommunicationRating,
        int ProblemSolvingRating,
        int CulturalFitRating,
        string? Strengths,
        string? Weaknesses,
        string Recommendation,
        string? Comments);
}

