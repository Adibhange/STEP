using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.QR.Queries.GetQRCodeByVacancy;

namespace STEP.Api.Controllers.v2
{
    [Authorize(Policy = "Vacancy.Create")]
    public class QRCodesController(ISender mediator) : BaseApiControllerV2
    {
        /// <summary>
        /// Retrieves the active QR code and dynamic registration link for a vacancy.
        /// </summary>
        [HttpGet("vacancy/{vacancyId:int}")]
        public async Task<IActionResult> GetByVacancy(int vacancyId)
        {
            var qrCode = await mediator.Send(new GetQRCodeByVacancyQuery(vacancyId));
            return Ok(ApiResponse<object?>.Ok(qrCode, qrCode != null ? "QR code retrieved successfully" : "No QR code generated for this vacancy yet"));
        }
    }
}
