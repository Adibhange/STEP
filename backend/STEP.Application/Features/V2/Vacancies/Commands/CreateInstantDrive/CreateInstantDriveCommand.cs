using System;
using MediatR;

namespace STEP.Application.Features.V2.Vacancies.Commands.CreateInstantDrive
{
    public record CreateInstantDriveCommand(
        int MasterRoleId,
        int? RoleHiringProfileId,
        int? DepartmentId,
        int? HiringLocationId,
        int? EmploymentTypeId,
        int? TestLocationId,
        int TotalOpenings = 5,
        DateTime? WalkinDriveDate = null,
        TimeSpan? WalkinStartTime = null,
        TimeSpan? WalkinEndTime = null
    ) : IRequest<InstantDriveResultDto>;
}
