using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Models;
using STEP.Application.Features.Offers.Commands.ApproveOffer;
using STEP.Application.Features.Offers.Commands.GenerateOfferLetter;
using STEP.Application.Features.Offers.Queries.GetOfferLetterById;

namespace STEP.Api.Controllers
{
    [Authorize(Policy = "Candidate.Approve")]
    public class OffersController(ISender mediator, IFileStorageService fileStorage) : BaseApiController
    {
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var offer = await mediator.Send(new GetOfferLetterByIdQuery(id));
            return Ok(ApiResponse<object>.Ok(offer, "Offer letter retrieved successfully"));
        }

        [HttpGet("{id:int}/download")]
        public async Task<IActionResult> Download(int id)
        {
            var offer = await mediator.Send(new GetOfferLetterByIdQuery(id));
            if (string.IsNullOrEmpty(offer.GeneratedPdfPath))
            {
                return NotFound(ApiResponse<object>.Fail("No PDF has been generated for this offer.", statusCode: 404));
            }

            var bytes = await fileStorage.ReadAsync(offer.GeneratedPdfPath);
            return File(bytes, "application/pdf", $"Offer_{offer.CandidateName.Replace(' ', '_')}.pdf");
        }

        [HttpPost]
        public async Task<IActionResult> Generate([FromBody] GenerateOfferLetterRequestBody body)
        {
            var preparedByUserId = CurrentUserId ?? throw new System.UnauthorizedAccessException("Unable to resolve the current user.");
            var offer = await mediator.Send(new GenerateOfferLetterCommand(body.CandidateId, body.OfferedCTC, body.JoiningDate, preparedByUserId));
            return Ok(ApiResponse<object>.Ok(offer, "Offer letter generated successfully"));
        }

        [HttpPost("{id:int}/approve")]
        public async Task<IActionResult> Approve(int id, [FromBody] ApproveOfferRequestBody body)
        {
            var directorUserId = CurrentUserId ?? throw new System.UnauthorizedAccessException("Unable to resolve the current user.");
            await mediator.Send(new ApproveOfferCommand(id, body.DirectorPin, directorUserId));
            return Ok(ApiResponse<object>.Ok(new { }, "Offer letter approved successfully"));
        }
    }

    public record ApproveOfferRequestBody(string DirectorPin);

    /// <summary>Same shape as GenerateOfferLetterCommand minus PreparedByUserId â€” that's derived
    /// server-side from the JWT, never trusted from the client (mirrors ApproveOffer/Interviews.Publish).</summary>
    public record GenerateOfferLetterRequestBody(int CandidateId, decimal OfferedCTC, System.DateTime JoiningDate);
}

