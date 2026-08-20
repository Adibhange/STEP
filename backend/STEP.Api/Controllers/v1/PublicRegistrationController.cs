using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.QR.Commands.RecordQRScan;
using STEP.Application.Features.QR.Commands.RegisterCandidateViaQR;
using STEP.Application.Features.QR.Queries.CheckQRRegistrationEligibility;

namespace STEP.Api.Controllers.v1
{
    /// <summary>
    /// Entirely anonymous public candidate application gateway for QR walk-ins.
    /// </summary>
    [Route("api/v2/apply")]
    [Route("api/v1/apply")]
    [Route("api/apply")]
    public class PublicRegistrationController(ISender mediator) : BaseApiController
    {
        [HttpGet("{code}")]
        public async Task<IActionResult> ScanQRCode(string code)
        {
            var result = await mediator.Send(new RecordQRScanCommand(code, HttpContext.Connection.RemoteIpAddress?.ToString(), Request.Headers.UserAgent.ToString()));
            return Ok(ApiResponse<object>.Ok(result, "Scan recorded"));
        }

        [HttpGet("{code}/eligibility")]
        public async Task<IActionResult> CheckEligibility(string code, [FromQuery] string? email, [FromQuery] string? phone)
        {
            var result = await mediator.Send(new CheckQRRegistrationEligibilityQuery(code, email, phone));
            return Ok(ApiResponse<object>.Ok(result, "Eligibility checked"));
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterCandidateViaQRCommand command)
        {
            var candidate = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(candidate, "Registration submitted successfully"));
        }
    }
}
