using FluentValidation;

namespace STEP.Application.Features.Exams.Commands.EvaluateCandidateAnswer
{
    public class EvaluateCandidateAnswerCommandValidator : AbstractValidator<EvaluateCandidateAnswerCommand>
    {
        public EvaluateCandidateAnswerCommandValidator()
        {
            RuleFor(x => x.CandidateExamAnswerId).GreaterThan(0);
            RuleFor(x => x.MarksObtained).GreaterThanOrEqualTo(0);
        }
    }
}
