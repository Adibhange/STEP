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
        public async Task<bool> Handle(SaveExamAnswerCommand request, CancellationToken cancellationToken)
        {
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
