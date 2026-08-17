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
        private const int GracePeriodSeconds = 120; // 2 minutes grace period for offline buffering sync

        public async Task<SaveExamAnswerBatchResultDto> Handle(SaveExamAnswerBatchCommand request, CancellationToken cancellationToken)
        {
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

            var syncedCount = 0;
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
                syncedCount++;
            }

            await db.SaveChangesAsync(cancellationToken);

            return new SaveExamAnswerBatchResultDto(
                syncedCount,
                DateTime.UtcNow,
                session.SessionStatus
            );
        }
    }
}
