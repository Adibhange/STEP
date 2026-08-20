using System;
using MediatR;

namespace STEP.Application.Features.V2.Vacancies.Commands.CreateInstantDrive
{
    public record CreateInstantDriveCommand(
        int MasterRoleId,
        int? RoleHiringProfileId = null,
        int? BlueprintId = null,
        string? DriveType = "Walk-in Drive",
        int? DepartmentId = null,
        int? HiringLocationId = null,
        int? EmploymentTypeId = null,
        int? TestLocationId = null,
        int TotalOpenings = 5,
        DateTime? WalkinDriveDate = null,
        TimeSpan? WalkinStartTime = null,
        TimeSpan? WalkinEndTime = null
    ) : IRequest<InstantDriveResultDto>;
}
