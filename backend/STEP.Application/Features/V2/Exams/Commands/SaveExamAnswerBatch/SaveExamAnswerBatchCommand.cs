using System;
using System.Collections.Generic;
using MediatR;

namespace STEP.Application.Features.V2.Exams.Commands.SaveExamAnswerBatch
{
    public class AnswerBatchItemInput
    {
        public int CandidateExamSessionQuestionId { get; set; }
        public string? SubmittedAnswerText { get; set; }
        public List<int>? SelectedOptionIds { get; set; } = new();
        public DateTime? ClientTimestamp { get; set; }
    }

    public class SaveExamAnswerBatchCommand : IRequest<SaveExamAnswerBatchResultDto>
    {
        public string SessionToken { get; set; } = string.Empty;
        public List<AnswerBatchItemInput> Answers { get; set; } = new();
    }

    public record SaveExamAnswerBatchResultDto(
        int SyncedCount,
        DateTime ServerSyncedAtUtc,
        string SessionStatus
    );
}
