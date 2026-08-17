using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Services;
using STEP.Application.Features.Exams.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Exam;

namespace STEP.Application.Features.V2.Exams.Commands.PublishAssessmentResultV2
{
    public class PublishAssessmentResultV2CommandHandler(
        IApplicationDbContext db,
        ICandidateAdvancementService advancement)
        : IRequestHandler<PublishAssessmentResultV2Command, PublishResultDto>
    {
        private record SnapshotOptionPayload(int OriginalOptionId, string Label, string Text, bool IsCorrect);

        public async Task<PublishResultDto> Handle(PublishAssessmentResultV2Command request, CancellationToken cancellationToken)
        {
            var session = await db.CandidateExamSessions
                .Include(s => s.Answers).ThenInclude(a => a.SelectedOptions)
                .Include(s => s.Questions).ThenInclude(q => q.Options)
                .Include(s => s.CandidatePipelineProgress)
                .FirstOrDefaultAsync(s => s.Id == request.CandidateExamSessionId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateExamSession), request.CandidateExamSessionId);

            // 1. Auto-Submit if session was InProgress
            if (session.SessionStatus == "InProgress" || session.SessionStatus == "Ready")
            {
                session.SessionStatus = "Submitted";
                session.SubmittedAt ??= DateTime.UtcNow;
            }

            // 2. Auto-Evaluate Objective Questions (MCQs)
            foreach (var answer in session.Answers)
            {
                var question = session.Questions.FirstOrDefault(q => q.Id == answer.CandidateExamSessionQuestionId);
                if (question == null) continue;

                var isChoiceQuestion = question.QuestionType is "SINGLE_CHOICE" or "MULTI_CHOICE" or "Single Choice" or "Multi Choice";
                if (isChoiceQuestion && answer.EvaluationStatus != "Published")
                {
                    var selectedOptionIds = answer.SelectedOptions.Select(so => so.CandidateExamSessionQuestionOptionId).ToHashSet();
                    var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();

                    var isFullyCorrect = correctOptionIds.Count > 0 &&
                                         correctOptionIds.SetEquals(selectedOptionIds);

                    answer.MarksObtained = isFullyCorrect ? question.Marks : 0;
                    answer.EvaluationStatus = "Published";
                    answer.EvaluationLocked = true;
                    answer.EvaluatorRemarks = isFullyCorrect ? "Auto-graded (Correct)" : "Auto-graded (Incorrect)";
                }
                else if (!answer.EvaluationLocked)
                {
                    // For subjective/coding where manual review isn't yet completed, award baseline if non-empty
                    if (!string.IsNullOrWhiteSpace(answer.SubmittedAnswerText))
                    {
                        answer.MarksObtained = question.Marks * 0.75m; // baseline credit
                    }
                    answer.EvaluationStatus = "Published";
                    answer.EvaluationLocked = true;
                }
            }

            var progress = session.CandidatePipelineProgress
                ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(session.CandidatePipelineProgressId),
                    "This session is not linked to a candidate pipeline progress record.")]);

            var candidate = await db.Candidates
                .Include(c => c.PipelineProgressHistory)
                .FirstAsync(c => c.Id == progress.CandidateId, cancellationToken);

            // 3. Calculate Final Score & Percentage
            session.TotalScore = session.Answers.Sum(a => a.MarksObtained);
            session.Percentage = session.TotalMarks > 0 ? Math.Round(session.TotalScore / session.TotalMarks * 100, 2) : 0;
            session.ResultStatus = session.Percentage >= session.FrozenPassingPercentage ? "Pass" : "Fail";

            session.EvaluationStatus = "Published";
            session.SessionStatus = "Evaluated";
            session.EvaluatedAt = DateTime.UtcNow;
            session.EvaluatorId = request.EvaluatorUserId;

            // 4. Update Pipeline Progress
            var passed = session.ResultStatus == "Pass";
            progress.Status = passed ? "Passed" : "Failed";
            progress.ScoreObtained = session.Percentage;
            progress.CompletedAt = DateTime.UtcNow;
            progress.EvaluatedAt = DateTime.UtcNow;
            progress.EvaluatorId = request.EvaluatorUserId;
            progress.Remarks = request.Remarks ?? $"V2 Autonomous Screening Result: {session.ResultStatus} ({session.Percentage}%)";

            // 5. Zero-Touch Stage Advancement
            var advancementResult = await advancement.AdvanceOrResolveAsync(candidate, progress, passed, cancellationToken);

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                UserId = request.EvaluatorUserId,
                Action = "PublishAssessmentResultV2",
                EntityName = nameof(CandidateExamSession),
                EntityId = session.Id.ToString(),
            });

            await db.SaveChangesAsync(cancellationToken);

            return new PublishResultDto(
                session.Id,
                session.ResultStatus,
                session.TotalScore,
                session.TotalMarks,
                session.Percentage,
                advancementResult.Advanced,
                advancementResult.NextRoundTitle,
                advancementResult.NextRoundExamPasscode,
                advancementResult.CandidateStatus
            );
        }
    }
}
