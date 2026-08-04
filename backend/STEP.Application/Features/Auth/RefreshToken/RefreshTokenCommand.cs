using MediatR;
using STEP.Application.Features.Auth.Common;

namespace STEP.Application.Features.Auth.RefreshToken
{
    public record RefreshTokenCommand(string RefreshToken, string? IpAddress) : IRequest<AuthResultDto>;
}
