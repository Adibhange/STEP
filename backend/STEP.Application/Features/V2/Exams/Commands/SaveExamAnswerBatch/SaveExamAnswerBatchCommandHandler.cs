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
                if (sessionV2.SessionStatus != "InProgress" && sessionV2.SessionStatus != "Ready" && sessionV2.SessionStatus != "Created")
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
                foreach (var item in request.Answers)
                {
                    var question = sessionV2.Questions.FirstOrDefault(q => q.Id == item.CandidateExamSessionQuestionId);
                    if (question == null) continue;

                    var answer = sessionV2.Answers.FirstOrDefault(a => a.CandidateExamSessionQuestionId == question.Id);
                    if (answer == null || answer.EvaluationLocked) continue;

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

                    syncedCount++;
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

            if (session.SessionStatus != "InProgress" && session.SessionStatus != "Ready" && session.SessionStatus != "Created")
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
                if (answer == null || answer.EvaluationLocked) continue;

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
