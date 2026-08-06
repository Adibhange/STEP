using MediatR;
using STEP.Application.Features.QR.Common;

namespace STEP.Application.Features.QR.Queries.GetQRCodeByVacancy
{
    /// <summary>Returns null (not NotFound) when no QR code has been generated for this vacancy yet —
    /// that's an expected, normal state, not an error.</summary>
    public record GetQRCodeByVacancyQuery(int VacancyId) : IRequest<QRCodeDto?>;
}
