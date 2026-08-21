using System;
using System.Linq;
using FluentValidation;

namespace STEP.Application.Features.MasterData.Commands.CreateMasterData
{
    public class CreateMasterDataCommandValidator : AbstractValidator<CreateMasterDataCommand>
    {
        private static readonly string[] ValidCategories =
        [
            "roles",
            "departments",
            "hiringlocations",
            "employmenttypes",
            "experiencelevels",
            "experiences"
        ];

        public CreateMasterDataCommandValidator()
        {
            RuleFor(v => v.Category)
                .NotEmpty().WithMessage("Category is required.")
                .Must(c => ValidCategories.Contains(c.ToLowerInvariant().Trim()))
                .WithMessage("Invalid master data category. Valid categories: roles, departments, hiringlocations, employmenttypes, experiencelevels.");

            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(150).WithMessage("Name must not exceed 150 characters.");

            RuleFor(v => v.Code)
                .NotEmpty().WithMessage("Code is required.")
                .MaximumLength(30).WithMessage("Code must not exceed 30 characters.")
                .Matches(@"^[A-Za-z0-9_\-]+$").WithMessage("Code must contain only alphanumeric characters, underscores, or hyphens.");

            RuleFor(v => v.Description)
                .MaximumLength(250).WithMessage("Description must not exceed 250 characters.")
                .When(v => !string.IsNullOrEmpty(v.Description));

            When(v => v.Category.Equals("experiencelevels", StringComparison.OrdinalIgnoreCase) ||
                      v.Category.Equals("experiences", StringComparison.OrdinalIgnoreCase), () =>
            {
                RuleFor(v => v.MinYears)
                    .GreaterThanOrEqualTo(0.0m).WithMessage("Min experience years cannot be negative.")
                    .LessThanOrEqualTo(99.0m).WithMessage("Min experience years cannot exceed 99.")
                    .When(v => v.MinYears.HasValue);

                RuleFor(v => v.MaxYears)
                    .GreaterThanOrEqualTo(0.0m).WithMessage("Max experience years cannot be negative.")
                    .LessThanOrEqualTo(99.0m).WithMessage("Max experience years cannot exceed 99.")
                    .When(v => v.MaxYears.HasValue);

                RuleFor(v => v)
                    .Must(v => !v.MinYears.HasValue || !v.MaxYears.HasValue || v.MinYears.Value <= v.MaxYears.Value)
                    .WithMessage("Min experience years cannot exceed Max experience years.");
            });
        }
    }
}
