using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.QR.Common;
using STEP.Domain.Entities.QR;

namespace STEP.Application.Features.QR.Queries.GetQRCodeAnalytics
{
    public class GetQRCodeAnalyticsQueryHandler(IApplicationDbContext db) : IRequestHandler<GetQRCodeAnalyticsQuery, QRCodeAnalyticsDto>
    {
        public async Task<QRCodeAnalyticsDto> Handle(GetQRCodeAnalyticsQuery request, CancellationToken cancellationToken)
        {
            var exists = await db.QRCodes.AnyAsync(q => q.Id == request.QRCodeId, cancellationToken);
            if (!exists)
            {
                throw new NotFoundException(nameof(QRCode), request.QRCodeId);
            }

            var totalScans = await db.QRScanAnalytics.CountAsync(s => s.QRCodeId == request.QRCodeId, cancellationToken);
            var successful = await db.QRScanAnalytics.CountAsync(s => s.QRCodeId == request.QRCodeId && s.ResultedInRegistration, cancellationToken);
            var conversionRate = totalScans > 0 ? System.Math.Round((decimal)successful / totalScans * 100, 2) : 0;

            return new QRCodeAnalyticsDto(request.QRCodeId, totalScans, successful, conversionRate);
        }
    }
}
