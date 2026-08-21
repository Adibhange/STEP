using System.Linq;
using FluentValidation;

namespace STEP.Application.Features.Vacancies.Commands.CreateVacancy
{
    public class CreateVacancyCommandValidator : AbstractValidator<CreateVacancyCommand>
    {
        public CreateVacancyCommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
            RuleFor(x => x.MasterRoleId).GreaterThan(0);
            RuleFor(x => x.DepartmentId).GreaterThan(0);
            RuleFor(x => x.HiringLocationId).GreaterThan(0);
            RuleFor(x => x.EmploymentTypeId).GreaterThan(0);
            RuleFor(x => x.DriveType).Must(v => v is "Walk-in" or "Direct").WithMessage("DriveType must be 'Walk-in' or 'Direct'.");
            RuleFor(x => x.WorkMode).Must(v => v is "On-site" or "Hybrid" or "Remote").WithMessage("WorkMode must be 'On-site', 'Hybrid', or 'Remote'.");
            RuleFor(x => x.Status).Must(v => v is "Draft" or "Active").WithMessage("Status must be 'Draft' or 'Active'.");
            RuleFor(x => x.TotalOpenings).GreaterThan(0);
            RuleFor(x => x.MaxExperienceYears).GreaterThanOrEqualTo(x => x.MinExperienceYears)
                .WithMessage("Maximum experience must be greater than or equal to minimum experience.");

            RuleFor(x => x.PipelineFlows).NotEmpty().WithMessage("At least one pipeline flow version is required.");
            RuleFor(x => x.PipelineFlows)
                .Must(flows => flows.Count(f => f.IsDefault) == 1)
                .WithMessage("Exactly one pipeline flow version must be marked as default.");
            RuleForEach(x => x.PipelineFlows).ChildRules(flow =>
            {
                flow.RuleFor(f => f.VersionName).NotEmpty().MaximumLength(150);
                flow.RuleFor(f => f.Rounds).NotEmpty().WithMessage("Each pipeline flow requires at least one round.");
            });

            RuleForEach(x => x.AssessmentSections).ChildRules(section =>
            {
                section.RuleFor(s => s.SectionTitle).NotEmpty().MaximumLength(150);
                section.RuleFor(s => s.TotalQuestions).GreaterThan(0);
                section.RuleFor(s => s.TimeLimitMinutes).GreaterThan(0);
                section.RuleFor(s => s.MarksPerQuestion).GreaterThan(0);
            });
        }
    }
}
