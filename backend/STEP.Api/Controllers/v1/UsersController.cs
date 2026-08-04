using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.Users.Commands.CreateUser;
using STEP.Application.Features.Users.Queries.GetUsers;

namespace STEP.Api.Controllers.v1
{
    [Authorize]
    public class UsersController(ISender mediator) : BaseApiController
    {
        [HttpGet]
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
    }
}
