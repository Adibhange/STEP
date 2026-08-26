using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Exam;

namespace STEP.Application.Features.Exams.Commands.SaveExamAnswer
{
    public class SaveExamAnswerCommandHandler(IApplicationDbContext db) : IRequestHandler<SaveExamAnswerCommand, bool>
    {
        // Small buffer over the nominal duration to absorb client/server clock skew and network
        // latency around the exact deadline moment — not a real time extension.
        private const int GracePeriodSeconds = 60;

        public async Task<bool> Handle(SaveExamAnswerCommand request, CancellationToken cancellationToken)
        {
            // 1. Try V2 Session first
            var sessionV2 = await db.CandidateExamSessionsV2
                .Include(s => s.Answers).ThenInclude(a => a.SelectedOptions)
                .Include(s => s.Questions).ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(s => s.SessionToken == request.SessionToken, cancellationToken);

            if (sessionV2 != null)
            {
                if (sessionV2.SessionStatus != "InProgress" && sessionV2.SessionStatus != "Ready" && sessionV2.SessionStatus != "Created")
                {
                    throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(sessionV2.SessionStatus),
                        $"Cannot save an answer — session status is '{sessionV2.SessionStatus}'.")]);
                }

                if (sessionV2.SessionStatus == "Ready" || sessionV2.SessionStatus == "Created")
                {
                    sessionV2.SessionStatus = "InProgress";
                    sessionV2.StartedAt ??= DateTimeOffset.UtcNow;
                }

                var questionV2 = sessionV2.Questions.FirstOrDefault(q => q.Id == request.CandidateExamSessionQuestionId)
                    ?? throw new NotFoundException(nameof(CandidateExamSessionQuestionV2), request.CandidateExamSessionQuestionId);

                var answerV2 = sessionV2.Answers.FirstOrDefault(a => a.CandidateExamSessionQuestionId == questionV2.Id);
                if (answerV2 == null)
                {
                    answerV2 = new CandidateExamAnswerV2
                    {
                        CandidateExamSessionId = sessionV2.Id,
                        CandidateExamSessionQuestionId = questionV2.Id,
                    };
                    sessionV2.Answers.Add(answerV2);
                }

                if (answerV2.EvaluationLocked)
                {
                    throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(answerV2.EvaluationLocked),
                        "This answer has already been published and is locked.")]);
                }

                answerV2.SubmittedAnswerText = request.SubmittedAnswerText;
                answerV2.AnsweredAt = DateTimeOffset.UtcNow;

                answerV2.SelectedOptions.Clear();
                if (request.SelectedOptionIds != null && request.SelectedOptionIds.Count != 0)
                {
                    var validOptionIds = questionV2.Options.Select(o => o.Id).ToHashSet();
                    foreach (var optionId in request.SelectedOptionIds.Where(validOptionIds.Contains).Distinct())
                    {
                        answerV2.SelectedOptions.Add(new CandidateExamAnswerOptionV2
                        {
                            CandidateExamSessionQuestionOptionId = optionId
                        });
                    }
                }

                await db.SaveChangesAsync(cancellationToken);
                return true;
            }

            // 2. Fallback to V1 Session
            var session = await db.CandidateExamSessions
                .Include(s => s.Answers).ThenInclude(a => a.SelectedOptions)
                .Include(s => s.Questions).ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(s => s.SessionToken == request.SessionToken, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateExamSession), request.SessionToken);

            if (session.SessionStatus != "InProgress")
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(session.SessionStatus),
                    $"Cannot save an answer — session status is '{session.SessionStatus}'.")]);
            }

            var deadline = (session.StartedAt ?? DateTime.UtcNow).AddMinutes(session.FrozenTotalDurationMinutes).AddSeconds(GracePeriodSeconds);
            if (session.StartedAt.HasValue && DateTime.UtcNow > deadline)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(session.SessionStatus),
                    "The allotted exam time has expired. Please submit your exam — further answer changes are no longer accepted.")]);
            }

            var question = session.Questions.FirstOrDefault(q => q.Id == request.CandidateExamSessionQuestionId)
                ?? throw new NotFoundException(nameof(CandidateExamSessionQuestion), request.CandidateExamSessionQuestionId);

            var answer = session.Answers.FirstOrDefault(a => a.CandidateExamSessionQuestionId == question.Id)
                ?? throw new NotFoundException(nameof(CandidateExamAnswer), request.CandidateExamSessionQuestionId);

            if (answer.EvaluationLocked)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(answer.EvaluationLocked),
                    "This answer has already been published and is locked.")]);
            }

            answer.SubmittedAnswerText = request.SubmittedAnswerText;
            answer.AnsweredAt = System.DateTime.UtcNow;

            answer.SelectedOptions.Clear();
            if (request.SelectedOptionIds.Count != 0)
            {
                var validOptionIds = question.Options.Select(o => o.Id).ToHashSet();
                foreach (var optionId in request.SelectedOptionIds.Where(validOptionIds.Contains).Distinct())
                {
                    answer.SelectedOptions.Add(new CandidateExamAnswerOption { CandidateExamSessionQuestionOptionId = optionId });
                }
            }

            session.ActiveQuestionIndex = question.DisplayOrder - 1;

            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
