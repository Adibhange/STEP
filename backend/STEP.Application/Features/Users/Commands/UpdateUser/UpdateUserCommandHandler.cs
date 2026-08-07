using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Users.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Identity;

namespace STEP.Application.Features.Users.Commands.UpdateUser
{
    public class UpdateUserCommandHandler(IApplicationDbContext db) : IRequestHandler<UpdateUserCommand, UserDto>
    {
        public async Task<UserDto> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken)
                ?? throw new NotFoundException(nameof(User), request.Id);

            var emailTaken = await db.Users.AnyAsync(
                u => u.Id != request.Id && u.Email.ToLower() == request.Email.ToLower(), cancellationToken);
            if (emailTaken)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.Email), "A user with this email already exists.")]);
            }

            var role = await db.Roles.FirstOrDefaultAsync(r => r.Id == request.RoleId, cancellationToken)
                ?? throw new NotFoundException(nameof(Role), request.RoleId);

            user.FirstName = request.FirstName.Trim();
            user.LastName = request.LastName.Trim();
            user.Email = request.Email.Trim();
            user.RoleId = request.RoleId;
            user.DepartmentId = request.DepartmentId;
            user.IsActive = request.IsActive;

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                Action = "UpdateUser",
                EntityName = nameof(User),
                EntityId = user.Id.ToString(),
            });

            await db.SaveChangesAsync(cancellationToken);

            var department = user.DepartmentId.HasValue
                ? await db.MasterDepartments.FirstOrDefaultAsync(d => d.Id == user.DepartmentId, cancellationToken)
                : null;

            return new UserDto(user.Id, user.EmployeeCode, user.FirstName, user.LastName, user.Email, role.Name,
                department?.Name, user.IsActive ? "Active" : "Inactive");
        }
    }
}
