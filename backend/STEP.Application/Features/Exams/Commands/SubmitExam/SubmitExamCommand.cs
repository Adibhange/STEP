using MediatR;
using STEP.Application.Features.Exams.Common;

namespace STEP.Application.Features.Exams.Commands.SubmitExam
{
    /// <summary>Finalizes the attempt: MCQ answers are auto-evaluated immediately; Coding/SQL/Subjective wait for manual evaluation.</summary>
    public record SubmitExamCommand(string SessionToken) : IRequest<SubmitExamResultDto>;
}
