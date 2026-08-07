using MediatR;
using STEP.Application.Features.Users.Common;

namespace STEP.Application.Features.Users.Commands.UpdateUser
{
    /// <summary>
    /// Edits an existing user's profile/role/department, or flips their active status.
    /// UsersView's "Edit User" dialog and the Active/Inactive status badge both submit this —
    /// the status badge just resends the user's current fields with IsActive toggled.
    /// </summary>
    public record UpdateUserCommand(
        int Id,
        string FirstName,
        string LastName,
        string Email,
        int RoleId,
        int? DepartmentId,
        bool IsActive) : IRequest<UserDto>;
}
