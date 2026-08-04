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
        private static readonly string[] McqTypes = ["SINGLE_CHOICE", "MULTI_CHOICE"];

        public async Task<SubmitExamResultDto> Handle(SubmitExamCommand request, CancellationToken cancellationToken)
        {
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

            var questionsById = session.Questions.ToDictionary(q => q.Id);

            foreach (var answer in session.Answers)
            {
                var question = questionsById[answer.CandidateExamSessionQuestionId];
                if (!McqTypes.Contains(question.QuestionType))
                {
                    continue; // Coding/SQL/Subjective — left Pending for manual evaluation.
                }

                var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                var selectedOptionIds = answer.SelectedOptions.Select(o => o.CandidateExamSessionQuestionOptionId).ToHashSet();

                // All-or-nothing: the selected set must exactly match the correct set.
                var isCorrect = correctOptionIds.SetEquals(selectedOptionIds);

                answer.MarksObtained = isCorrect ? answer.Marks : 0;
                answer.EvaluationStatus = "Evaluated";
                answer.EvaluatedAt = DateTime.UtcNow;
            }

            session.SessionStatus = "Submitted";
            session.SubmittedAt = DateTime.UtcNow;
            session.TotalScore = session.Answers.Sum(a => a.MarksObtained);
            session.Percentage = session.TotalMarks > 0 ? Math.Round(session.TotalScore / session.TotalMarks * 100, 2) : 0;

            var pendingManualCount = session.Answers.Count(a => a.EvaluationStatus == "Pending");
            session.EvaluationStatus = pendingManualCount == 0 ? "FullyEvaluated"
                : pendingManualCount == session.Answers.Count ? "Pending"
                : "PartiallyEvaluated";

            await db.SaveChangesAsync(cancellationToken);

            return new SubmitExamResultDto(session.SessionStatus, session.TotalScore, session.TotalMarks, pendingManualCount);
        }
    }
}
