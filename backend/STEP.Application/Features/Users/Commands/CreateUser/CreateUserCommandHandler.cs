using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Users.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Identity;

namespace STEP.Application.Features.Users.Commands.CreateUser
{
    public class CreateUserCommandHandler(IApplicationDbContext db, IPasswordHasher hasher)
        : IRequestHandler<CreateUserCommand, UserDto>
    {
        public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            var emailTaken = await db.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);
            if (emailTaken)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.Email), "A user with this email already exists.")]);
            }

            var role = await db.Roles.FirstOrDefaultAsync(r => r.Id == request.RoleId, cancellationToken)
                ?? throw new NotFoundException(nameof(Role), request.RoleId);

            var existingCodes = await db.Users.IgnoreQueryFilters()
                .Select(u => u.EmployeeCode)
                .ToListAsync(cancellationToken);

            var maxSequence = 1000;
            foreach (var code in existingCodes)
            {
                if (code.StartsWith("EMP-", StringComparison.OrdinalIgnoreCase) &&
                    int.TryParse(code.Substring(4), out var num) &&
                    num > maxSequence)
                {
                    maxSequence = num;
                }
            }

            var nextSequence = maxSequence + 1;
            while (existingCodes.Contains($"EMP-{nextSequence}", StringComparer.OrdinalIgnoreCase))
            {
                nextSequence++;
            }

            var user = new User
            {
                EmployeeCode = $"EMP-{nextSequence}",
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = request.Email.Trim(),
                PasswordHash = hasher.Hash(request.TempPassword),
                PinHash = string.IsNullOrEmpty(request.Pin) ? null : hasher.Hash(request.Pin),
                RoleId = request.RoleId,
                DepartmentId = request.DepartmentId,
                IsActive = true
            };

            db.Users.Add(user);

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                Action = "CreateUser",
                EntityName = nameof(User),
                EntityId = user.Id.ToString()
            });

            await db.SaveChangesAsync(cancellationToken);

            return new UserDto(user.Id, user.EmployeeCode, user.FirstName, user.LastName, user.Email, role.Name,
                null, user.IsActive ? "Active" : "Inactive");
        }
    }
}
