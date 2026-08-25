using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Exams.Common;
using STEP.Domain.Entities.Exam;

namespace STEP.Application.Features.Exams.Commands.SubmitExam
{
    public class SubmitExamCommandHandler(IApplicationDbContext db) : IRequestHandler<SubmitExamCommand, SubmitExamResultDto>
    {
        private static readonly string[] McqTypes = ["SINGLE_CHOICE", "MULTI_CHOICE", "Single Choice", "Multi Choice"];

        public async Task<SubmitExamResultDto> Handle(SubmitExamCommand request, CancellationToken cancellationToken)
        {
            // 1. Try V2 Session
            var sessionV2 = await db.CandidateExamSessionsV2
                .Include(s => s.Candidate)
                .Include(s => s.Answers).ThenInclude(a => a.SelectedOptions)
                .Include(s => s.Questions).ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(s => s.SessionToken == request.SessionToken, cancellationToken);

            if (sessionV2 != null)
            {
                var questionsById = sessionV2.Questions.ToDictionary(q => q.Id);

                foreach (var answer in sessionV2.Answers)
                {
                    if (!questionsById.TryGetValue(answer.CandidateExamSessionQuestionId, out var question))
                        continue;

                    if (!McqTypes.Contains(question.QuestionType))
                    {
                        continue; // Coding/SQL/Subjective — left Pending for evaluator review.
                    }

                    var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                    var selectedOptionIds = answer.SelectedOptions.Select(o => o.CandidateExamSessionQuestionOptionId).ToHashSet();

                    var isCorrect = correctOptionIds.Count > 0 && correctOptionIds.SetEquals(selectedOptionIds);

                    answer.MarksObtained = isCorrect ? question.Marks : 0;
                    answer.EvaluationStatus = "Evaluated";
                    answer.EvaluationLocked = true;
                    answer.EvaluatorRemarks = isCorrect ? "Auto-graded (Correct)" : "Auto-graded (Incorrect)";
                    answer.AnsweredAt ??= DateTimeOffset.UtcNow;
                }

                sessionV2.TotalMarks = sessionV2.Questions.Sum(q => q.Marks);
                sessionV2.TotalScore = sessionV2.Answers.Sum(a => a.MarksObtained);
                sessionV2.Percentage = sessionV2.TotalMarks > 0 ? Math.Round(sessionV2.TotalScore / sessionV2.TotalMarks * 100, 2) : 0;
                sessionV2.ResultStatus = sessionV2.Percentage >= sessionV2.PassingPercentage ? "Pass" : "Fail";
                sessionV2.SessionStatus = "Submitted";
                sessionV2.SubmittedAt = DateTimeOffset.UtcNow;
                sessionV2.UpdatedAt = DateTimeOffset.UtcNow;

                var pendingManualCount = sessionV2.Answers.Count(a => a.EvaluationStatus == "Pending");
                sessionV2.EvaluationStatus = pendingManualCount == 0 ? "Published"
                    : pendingManualCount == sessionV2.Answers.Count ? "Pending"
                    : "PartiallyEvaluated";

                if (pendingManualCount == 0)
                {
                    sessionV2.EvaluatedAt = DateTimeOffset.UtcNow;
                }

                // Update candidate pipeline progress status and score
                var progId = sessionV2.CandidatePipelineProgressId;
                if (progId.HasValue)
                {
                    var progress = await db.CandidatePipelineProgresses
                        .FirstOrDefaultAsync(p => p.Id == progId.Value, cancellationToken);

                    if (progress != null)
                    {
                        progress.ScoreObtained = sessionV2.Percentage;
                        progress.CompletedAt = DateTime.UtcNow;
                        progress.Status = pendingManualCount == 0
                            ? (sessionV2.ResultStatus == "Pass" ? "Passed" : "Failed")
                            : "Evaluated";
                        progress.Remarks = $"Assessment Score: {sessionV2.TotalScore}/{sessionV2.TotalMarks} ({sessionV2.Percentage}% — {sessionV2.ResultStatus})";
                    }
                }

                await db.SaveChangesAsync(cancellationToken);

                return new SubmitExamResultDto(
                    sessionV2.SessionStatus,
                    sessionV2.TotalScore,
                    sessionV2.TotalMarks,
                    pendingManualCount
                );
            }

            // 2. Fallback to V1 Session
            var session = await db.CandidateExamSessions
                .Include(s => s.Answers).ThenInclude(a => a.SelectedOptions)
                .Include(s => s.Questions).ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(s => s.SessionToken == request.SessionToken, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateExamSession), request.SessionToken);

            if (session.SessionStatus is not ("InProgress" or "Paused"))
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(session.SessionStatus),
                    $"Cannot submit — session status is already '{session.SessionStatus}'.")]);
            }

            var v1QuestionsById = session.Questions.ToDictionary(q => q.Id);

            foreach (var answer in session.Answers)
            {
                var question = v1QuestionsById[answer.CandidateExamSessionQuestionId];
                if (!McqTypes.Contains(question.QuestionType))
                {
                    continue;
                }

                var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                var selectedOptionIds = answer.SelectedOptions.Select(o => o.CandidateExamSessionQuestionOptionId).ToHashSet();

                var isCorrect = correctOptionIds.Count > 0 && correctOptionIds.SetEquals(selectedOptionIds);

                answer.MarksObtained = isCorrect ? answer.Marks : 0;
                answer.EvaluationStatus = "Evaluated";
                answer.EvaluatedAt = DateTime.UtcNow;
            }

            session.SessionStatus = "Submitted";
            session.SubmittedAt = DateTime.UtcNow;
            session.TotalScore = session.Answers.Sum(a => a.MarksObtained);
            session.Percentage = session.TotalMarks > 0 ? Math.Round(session.TotalScore / session.TotalMarks * 100, 2) : 0;

            var v1PendingManualCount = session.Answers.Count(a => a.EvaluationStatus == "Pending");
            session.EvaluationStatus = v1PendingManualCount == 0 ? "FullyEvaluated"
                : v1PendingManualCount == session.Answers.Count ? "Pending"
                : "PartiallyEvaluated";

            if (session.CandidatePipelineProgressId.HasValue)
            {
                var prog = await db.CandidatePipelineProgresses
                    .FirstOrDefaultAsync(p => p.Id == session.CandidatePipelineProgressId.Value, cancellationToken);
                if (prog != null)
                {
                    prog.ScoreObtained = session.Percentage;
                    prog.CompletedAt = DateTime.UtcNow;
                    prog.Status = v1PendingManualCount == 0
                        ? (session.Percentage >= session.FrozenPassingPercentage ? "Passed" : "Failed")
                        : "Evaluated";
                }
            }

            await db.SaveChangesAsync(cancellationToken);

            return new SubmitExamResultDto(session.SessionStatus, session.TotalScore, session.TotalMarks, v1PendingManualCount);
        }
    }
}
