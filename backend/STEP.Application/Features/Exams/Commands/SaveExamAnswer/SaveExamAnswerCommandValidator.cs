using FluentValidation;

namespace STEP.Application.Features.Exams.Commands.SaveExamAnswer
{
    public class SaveExamAnswerCommandValidator : AbstractValidator<SaveExamAnswerCommand>
    {
        public SaveExamAnswerCommandValidator()
        {
            RuleFor(x => x.SessionToken).NotEmpty();
            RuleFor(x => x.CandidateExamSessionQuestionId).GreaterThan(0);
        }
    }
}
