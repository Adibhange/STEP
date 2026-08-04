using System.Collections.Generic;
using MediatR;

namespace STEP.Application.Features.Exams.Commands.SaveExamAnswer
{
    /// <summary>Autosave for one question — called repeatedly while the candidate works through the paper.</summary>
    public record SaveExamAnswerCommand(
        string SessionToken,
        int CandidateExamSessionQuestionId,
        string? SubmittedAnswerText,
        List<int> SelectedOptionIds) : IRequest<bool>;
}
