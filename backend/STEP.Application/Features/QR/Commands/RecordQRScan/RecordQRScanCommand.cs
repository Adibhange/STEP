using MediatR;
using STEP.Application.Features.QR.Common;

namespace STEP.Application.Features.QR.Commands.RecordQRScan
{
    /// <summary>Called when a candidate visits the QR code's registration link, before filling out the form.</summary>
    public record RecordQRScanCommand(string Code, string? IpAddress, string? UserAgent) : IRequest<QRScanResultDto>;
}
