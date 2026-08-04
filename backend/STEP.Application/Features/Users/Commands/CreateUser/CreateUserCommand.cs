using MediatR;
using STEP.Application.Features.Users.Common;

namespace STEP.Application.Features.Users.Commands.CreateUser
{
    public record CreateUserCommand(
        string FirstName,
        string LastName,
        string Email,
        string TempPassword,
        int RoleId,
        int? DepartmentId,
        string? Pin) : IRequest<UserDto>;
}
