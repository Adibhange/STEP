using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.Auth.DirectorPin;
using STEP.Application.Features.Auth.Login;
using STEP.Application.Features.Auth.RefreshToken;

namespace STEP.Api.Controllers
{
    public class AuthController(ISender mediator) : BaseApiController
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestBody body)
        {
            var result = await mediator.Send(new LoginCommand(body.Email, body.Password, HttpContext.Connection.RemoteIpAddress?.ToString()));
            return Ok(ApiResponse<object>.Ok(result, "Authentication successful"));
        }

        [HttpPost("director-pin-login")]
        public async Task<IActionResult> DirectorPinLogin([FromBody] DirectorPinRequestBody body)
        {
            var result = await mediator.Send(new DirectorPinLoginCommand(body.Pin, HttpContext.Connection.RemoteIpAddress?.ToString()));
            return Ok(ApiResponse<object>.Ok(result, "Director PIN verified successfully"));
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestBody body)
        {
            var result = await mediator.Send(new RefreshTokenCommand(body.RefreshToken, HttpContext.Connection.RemoteIpAddress?.ToString()));
            return Ok(ApiResponse<object>.Ok(result, "Token refreshed successfully"));
        }
    }

    public record LoginRequestBody(string Email, string Password);
    public record DirectorPinRequestBody(string Pin);
    public record RefreshTokenRequestBody(string RefreshToken);
}

