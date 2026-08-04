using MediatR;

namespace STEP.Application.Features.Exams.Commands.EvaluateCandidateAnswer
{
    public record EvaluateCandidateAnswerCommand(
        int CandidateExamAnswerId,
        decimal MarksObtained,
        string? EvaluatorRemarks,
        int EvaluatedByUserId) : IRequest<bool>;
}
