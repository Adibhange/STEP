using System;
using System.Collections.Generic;
using MediatR;

namespace STEP.Application.Features.V2.Exams.Commands.SaveExamAnswerBatch
{
    public record AnswerBatchItemInput(
        int CandidateExamSessionQuestionId,
        string? SubmittedAnswerText,
        List<int> SelectedOptionIds,
        DateTime? ClientTimestamp
    );

    public record SaveExamAnswerBatchCommand(
        string SessionToken,
        List<AnswerBatchItemInput> Answers
    ) : IRequest<SaveExamAnswerBatchResultDto>;

    public record SaveExamAnswerBatchResultDto(
        int SyncedCount,
        DateTime ServerSyncedAtUtc,
        string SessionStatus
    );
}
