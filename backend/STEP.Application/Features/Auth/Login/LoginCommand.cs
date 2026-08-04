using MediatR;
using STEP.Application.Features.Auth.Common;

namespace STEP.Application.Features.Auth.Login
{
    public record LoginCommand(string Email, string Password, string? IpAddress) : IRequest<AuthResultDto>;
}
