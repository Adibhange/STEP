using MediatR;
using STEP.Application.Features.Auth.Common;

namespace STEP.Application.Features.Auth.DirectorPin
{
    /// <summary>
    /// The STEP login screen's Director PIN pad collects only a 4-digit PIN — no email — so the
    /// handler must identify the Director among all active Director-role users by PIN match.
    /// </summary>
    public record DirectorPinLoginCommand(string Pin, string? IpAddress) : IRequest<AuthResultDto>;
}
