using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.Users.Commands.CreateUser;
using STEP.Application.Features.Users.Commands.UpdateUser;
using STEP.Application.Features.Users.Queries.GetUsers;

namespace STEP.Api.Controllers
{
    [Authorize]
    public class UsersController(ISender mediator) : BaseApiController
    {
        [HttpGet]
        [Authorize(Policy = "User.Manage")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await mediator.Send(new GetUsersQuery());
            return Ok(ApiResponse<object>.Ok(users, "Users retrieved successfully"));
        }

        [HttpPost]
        [Authorize(Policy = "User.Manage")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserCommand command)
        {
            var user = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(user, "User created successfully"));
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = "User.Manage")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequestBody body)
        {
            var user = await mediator.Send(new UpdateUserCommand(
                id, body.FirstName, body.LastName, body.Email, body.RoleId, body.DepartmentId, body.IsActive));
            return Ok(ApiResponse<object>.Ok(user, "User updated successfully"));
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestBody body)
        {
            var userId = CurrentUserId ?? throw new UnauthorizedAccessException("Unable to resolve the current user.");
            await mediator.Send(new STEP.Application.Features.Users.Commands.ChangeUserPassword.ChangeUserPasswordCommand(
                userId, body.CurrentPassword, body.NewPassword));
            return Ok(ApiResponse<object>.Ok(true, "Password changed successfully"));
        }

        [HttpPost("change-pin")]
        public async Task<IActionResult> ChangePin([FromBody] ChangePinRequestBody body)
        {
            var userId = CurrentUserId ?? throw new UnauthorizedAccessException("Unable to resolve the current user.");
            await mediator.Send(new STEP.Application.Features.Users.Commands.ChangeUserPin.ChangeUserPinCommand(
                userId, body.CurrentPin, body.NewPin));
            return Ok(ApiResponse<object>.Ok(true, "4-Digit PIN changed successfully"));
        }
    }

    public record ChangePasswordRequestBody(string CurrentPassword, string NewPassword);
    public record ChangePinRequestBody(string CurrentPin, string NewPin);
    public record UpdateUserRequestBody(string FirstName, string LastName, string Email, int RoleId, int? DepartmentId, bool IsActive);
}

