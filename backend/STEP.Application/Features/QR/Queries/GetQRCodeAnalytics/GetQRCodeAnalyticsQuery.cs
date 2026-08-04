using MediatR;
using STEP.Application.Features.QR.Common;

namespace STEP.Application.Features.QR.Queries.GetQRCodeAnalytics
{
    public record GetQRCodeAnalyticsQuery(int QRCodeId) : IRequest<QRCodeAnalyticsDto>;
}
