using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Users.Common;

namespace STEP.Application.Features.Users.Queries.GetUsers
{
    public class GetUsersQueryHandler(IApplicationDbContext db) : IRequestHandler<GetUsersQuery, List<UserDto>>
    {
        public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
        {
            return await db.Users
                .Include(u => u.Role)
                .Include(u => u.Department)
                .OrderBy(u => u.FirstName).ThenBy(u => u.LastName)
                .Select(u => new UserDto(
                    u.Id,
                    u.EmployeeCode,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.Role.Name,
                    u.Department != null ? u.Department.Name : null,
                    u.IsActive ? "Active" : "Inactive"))
                .ToListAsync(cancellationToken);
        }
    }
}
