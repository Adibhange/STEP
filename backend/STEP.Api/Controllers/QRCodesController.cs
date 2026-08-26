using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.QR.Commands.GenerateQRCode;
using STEP.Application.Features.QR.Queries.GetQRCodeAnalytics;
using STEP.Application.Features.QR.Queries.GetQRCodeByVacancy;

namespace STEP.Api.Controllers
{
    /// <summary>Staff-only: generating a drive's QR code and viewing its scan/conversion analytics.</summary>
    [Authorize(Policy = "Vacancy.Create")]
    public class QRCodesController(ISender mediator) : BaseApiController
    {
        [HttpPost]
        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] GenerateQRCodeCommand command)
        {
            var qrCode = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(qrCode, "QR code generated successfully"));
        }

        [HttpGet("{id:int}/analytics")]
        public async Task<IActionResult> GetAnalytics(int id)
        {
            var analytics = await mediator.Send(new GetQRCodeAnalyticsQuery(id));
            return Ok(ApiResponse<object>.Ok(analytics, "QR code analytics retrieved successfully"));
        }

        [HttpGet("vacancy/{vacancyId:int}")]
        public async Task<IActionResult> GetByVacancy(int vacancyId)
        {
            var qrCode = await mediator.Send(new GetQRCodeByVacancyQuery(vacancyId));
            if (qrCode == null)
            {
                return Ok(ApiResponse<object?>.Ok(null, "No QR code generated for this vacancy yet"));
            }
            return Ok(ApiResponse<object?>.Ok(qrCode, "QR code retrieved successfully"));
        }
    }
}

