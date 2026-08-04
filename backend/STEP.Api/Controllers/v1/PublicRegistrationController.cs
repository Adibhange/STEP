using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.QR.Commands.RecordQRScan;
using STEP.Application.Features.QR.Commands.RegisterCandidateViaQR;

namespace STEP.Api.Controllers.v1
{
    /// <summary>
    /// Entirely anonymous — this is what a candidate's phone hits after scanning a walk-in drive
    /// QR code (frontend route would be something like /apply/{code}). No staff JWT involved.
    /// </summary>
    public class PublicRegistrationController(ISender mediator) : BaseApiController
    {
        [HttpGet("{code}")]
        public async Task<IActionResult> ScanQRCode(string code)
        {
            var result = await mediator.Send(new RecordQRScanCommand(code, HttpContext.Connection.RemoteIpAddress?.ToString(), Request.Headers.UserAgent.ToString()));
            return Ok(ApiResponse<object>.Ok(result, "Scan recorded"));
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterCandidateViaQRCommand command)
        {
            var candidate = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(candidate, "Registration submitted successfully"));
        }
    }
}
