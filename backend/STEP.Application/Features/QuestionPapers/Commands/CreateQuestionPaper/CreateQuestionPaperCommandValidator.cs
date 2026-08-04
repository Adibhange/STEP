using FluentValidation;

namespace STEP.Application.Features.QuestionPapers.Commands.CreateQuestionPaper
{
    public class CreateQuestionPaperCommandValidator : AbstractValidator<CreateQuestionPaperCommand>
    {
        public CreateQuestionPaperCommandValidator()
        {
            RuleFor(x => x.VacancyId).GreaterThan(0);
            RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
            RuleFor(x => x.DurationMinutes).GreaterThan(0);
            RuleFor(x => x.PassingPercentage).InclusiveBetween(1, 100);
        }
    }
}
