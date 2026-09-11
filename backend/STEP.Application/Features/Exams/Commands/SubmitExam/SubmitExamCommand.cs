using System.Collections.Generic;
using MediatR;
using STEP.Application.Features.Exams.Common;
using STEP.Application.Features.V2.Exams.Commands.SaveExamAnswerBatch;

namespace STEP.Application.Features.Exams.Commands.SubmitExam
{
    /// <summary>Finalizes the attempt: MCQ answers are auto-evaluated immediately; Coding/SQL/Subjective wait for manual evaluation.</summary>
    public record SubmitExamCommand(string SessionToken, string? Reason = null, List<AnswerBatchItemInput>? Answers = null) : IRequest<SubmitExamResultDto>;
}
