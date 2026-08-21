using System;
using FluentValidation;

namespace STEP.Application.Features.V2.Vacancies.Commands.CreateInstantDrive
{
    public class CreateInstantDriveCommandValidator : AbstractValidator<CreateInstantDriveCommand>
    {
        public CreateInstantDriveCommandValidator()
        {
            RuleFor(v => v)
                .Must(v => v.MasterRoleId > 0 || (v.RoleId.HasValue && v.RoleId.Value > 0))
                .WithMessage("A valid Master Role or Role Id is required.");

            RuleFor(v => v.TotalOpenings)
                .InclusiveBetween(1, 500)
                .WithMessage("Total openings must be between 1 and 500.");

            RuleFor(v => v.DriveType)
                .Must(d => string.IsNullOrWhiteSpace(d) || d.Trim().Equals("Walk-in Drive", StringComparison.OrdinalIgnoreCase) || d.Trim().Equals("Direct Hiring", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Drive type must be 'Walk-in Drive' or 'Direct Hiring'.");

            RuleFor(v => v.ExperienceLevelId)
                .GreaterThan(0).WithMessage("Experience Level Id must be greater than 0.")
                .When(v => v.ExperienceLevelId.HasValue);

            RuleFor(v => v.DepartmentId)
                .GreaterThan(0).WithMessage("Department Id must be greater than 0.")
                .When(v => v.DepartmentId.HasValue);

            RuleFor(v => v.HiringLocationId)
                .GreaterThan(0).WithMessage("Hiring Location Id must be greater than 0.")
                .When(v => v.HiringLocationId.HasValue);

            RuleFor(v => v.EmploymentTypeId)
                .GreaterThan(0).WithMessage("Employment Type Id must be greater than 0.")
                .When(v => v.EmploymentTypeId.HasValue);
        }
    }
}
