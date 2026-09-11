using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Exam;

namespace STEP.Application.Features.V2.Exams.Commands.SaveExamAnswerBatch
{
    public class SaveExamAnswerBatchCommandHandler(IApplicationDbContext db)
        : IRequestHandler<SaveExamAnswerBatchCommand, SaveExamAnswerBatchResultDto>
    {
        public async Task<SaveExamAnswerBatchResultDto> Handle(SaveExamAnswerBatchCommand request, CancellationToken cancellationToken)
        {
            // 1. Try V2 session first
            var sessionV2 = await db.CandidateExamSessionsV2
                .Include(s => s.Answers).ThenInclude(a => a.SelectedOptions)
                .Include(s => s.Questions).ThenInclude(q => q.Options)
                .AsSplitQuery()
                .FirstOrDefaultAsync(s => s.SessionToken == request.SessionToken, cancellationToken);

            if (sessionV2 != null)
            {
                if (sessionV2.SessionStatus != "InProgress" && sessionV2.SessionStatus != "Ready" && sessionV2.SessionStatus != "Created" && sessionV2.SessionStatus != "Submitted")
                {
                    throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(sessionV2.SessionStatus),
                        $"Cannot sync answers — session is in status '{sessionV2.SessionStatus}'.")]);
                }

                if (sessionV2.SessionStatus == "Ready" || sessionV2.SessionStatus == "Created")
                {
                    sessionV2.SessionStatus = "InProgress";
                    sessionV2.StartedAt ??= DateTimeOffset.UtcNow;
                }

                var syncedCount = 0;
                var mcqTypes = new[] { "SINGLE_CHOICE", "MULTI_CHOICE", "Single Choice", "Multi Choice" };

                foreach (var item in request.Answers)
                {
                    var question = sessionV2.Questions.FirstOrDefault(q => q.Id == item.CandidateExamSessionQuestionId);
                    if (question == null) continue;

                    var answer = sessionV2.Answers.FirstOrDefault(a => a.CandidateExamSessionQuestionId == question.Id);
                    if (answer == null)
                    {
                        answer = new CandidateExamAnswerV2
                        {
                            CandidateExamSessionId = sessionV2.Id,
                            CandidateExamSessionQuestionId = question.Id,
                            MarksObtained = 0,
                            EvaluationStatus = "Pending",
                            EvaluationLocked = false
                        };
                        sessionV2.Answers.Add(answer);
                    }

                    answer.SubmittedAnswerText = item.SubmittedAnswerText;
                    answer.AnsweredAt = item.ClientTimestamp.HasValue ? new DateTimeOffset(item.ClientTimestamp.Value) : DateTimeOffset.UtcNow;

                    answer.SelectedOptions.Clear();
                    if (item.SelectedOptionIds != null && item.SelectedOptionIds.Count > 0)
                    {
                        var validOptionIds = question.Options.Select(o => o.Id).ToHashSet();
                        foreach (var optionId in item.SelectedOptionIds.Where(validOptionIds.Contains).Distinct())
                        {
                            answer.SelectedOptions.Add(new CandidateExamAnswerOptionV2
                            {
                                CandidateExamSessionQuestionOptionId = optionId
                            });
                        }
                    }

                    // If session was already submitted, re-grade MCQ answers immediately
                    if (sessionV2.SessionStatus == "Submitted" && mcqTypes.Contains(question.QuestionType))
                    {
                        var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                        var selectedOptionIds = answer.SelectedOptions.Select(o => o.CandidateExamSessionQuestionOptionId).ToHashSet();
                        var isCorrect = correctOptionIds.Count > 0 && correctOptionIds.SetEquals(selectedOptionIds);
                        answer.MarksObtained = isCorrect ? question.Marks : 0;
                        answer.EvaluationStatus = "Evaluated";
                        answer.EvaluationLocked = true;
                        answer.EvaluatorRemarks = isCorrect ? "Auto-graded (Correct)" : "Auto-graded (Incorrect)";
                    }

                    syncedCount++;
                }

                if (sessionV2.SessionStatus == "Submitted")
                {
                    sessionV2.TotalScore = sessionV2.Answers.Sum(a => a.MarksObtained);
                    var pendingCount = sessionV2.Answers.Count(a => a.EvaluationStatus == "Pending");
                    if (pendingCount == 0)
                    {
                        sessionV2.Percentage = sessionV2.TotalMarks > 0 ? Math.Round(sessionV2.TotalScore / sessionV2.TotalMarks * 100, 2) : 0;
                        sessionV2.ResultStatus = sessionV2.Percentage >= sessionV2.PassingPercentage ? "Pass" : "Fail";
                    }
                }

                sessionV2.UpdatedAt = DateTimeOffset.UtcNow;
                await db.SaveChangesAsync(cancellationToken);

                return new SaveExamAnswerBatchResultDto(
                    syncedCount,
                    DateTime.UtcNow,
                    sessionV2.SessionStatus
                );
            }

            // 2. Fallback to V1 session
            var session = await db.CandidateExamSessions
                .Include(s => s.Answers).ThenInclude(a => a.SelectedOptions)
                .Include(s => s.Questions).ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(s => s.SessionToken == request.SessionToken, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateExamSession), request.SessionToken);

            if (session.SessionStatus != "InProgress" && session.SessionStatus != "Ready" && session.SessionStatus != "Created" && session.SessionStatus != "Submitted")
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(session.SessionStatus),
                    $"Cannot sync answers — session is in status '{session.SessionStatus}'.")]);
            }

            if (session.SessionStatus == "Ready" || session.SessionStatus == "Created")
            {
                session.SessionStatus = "InProgress";
                session.StartedAt ??= DateTime.UtcNow;
            }

            var syncedCountV1 = 0;
            foreach (var item in request.Answers)
            {
                var question = session.Questions.FirstOrDefault(q => q.Id == item.CandidateExamSessionQuestionId);
                if (question == null) continue;

                var answer = session.Answers.FirstOrDefault(a => a.CandidateExamSessionQuestionId == question.Id);
                if (answer == null)
                {
                    answer = new CandidateExamAnswer
                    {
                        CandidateExamSessionId = session.Id,
                        CandidateExamSessionQuestionId = question.Id,
                        Marks = question.Marks,
                        MarksObtained = 0,
                        EvaluationStatus = "Pending",
                        EvaluationLocked = false
                    };
                    session.Answers.Add(answer);
                }

                if (answer.EvaluationLocked) continue;

                answer.SubmittedAnswerText = item.SubmittedAnswerText;
                answer.AnsweredAt = item.ClientTimestamp ?? DateTime.UtcNow;

                answer.SelectedOptions.Clear();
                if (item.SelectedOptionIds != null && item.SelectedOptionIds.Count > 0)
                {
                    var validOptionIds = question.Options.Select(o => o.Id).ToHashSet();
                    foreach (var optionId in item.SelectedOptionIds.Where(validOptionIds.Contains).Distinct())
                    {
                        answer.SelectedOptions.Add(new CandidateExamAnswerOption
                        {
                            CandidateExamSessionQuestionOptionId = optionId
                        });
                    }
                }

                session.ActiveQuestionIndex = Math.Max(0, question.DisplayOrder - 1);
                syncedCountV1++;
            }

            await db.SaveChangesAsync(cancellationToken);

            return new SaveExamAnswerBatchResultDto(
                syncedCountV1,
                DateTime.UtcNow,
                session.SessionStatus
            );
        }
    }
}
