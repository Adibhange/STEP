using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Exam;

namespace STEP.Application.Features.Exams.Commands.EvaluateCandidateAnswer
{
    public class EvaluateCandidateAnswerCommandHandler(IApplicationDbContext db) : IRequestHandler<EvaluateCandidateAnswerCommand, bool>
    {
        public async Task<bool> Handle(EvaluateCandidateAnswerCommand request, CancellationToken cancellationToken)
        {
            var answer = await db.CandidateExamAnswers
                .Include(a => a.CandidateExamSessionQuestion)
                .FirstOrDefaultAsync(a => a.Id == request.CandidateExamAnswerId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateExamAnswer), request.CandidateExamAnswerId);

            if (answer.EvaluationLocked)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(answer.EvaluationLocked),
                    "This answer has already been published and is locked.")]);
            }

            if (request.MarksObtained > answer.Marks)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.MarksObtained),
                    $"MarksObtained ({request.MarksObtained}) cannot exceed the question's max marks ({answer.Marks}).")]);
            }

            answer.MarksObtained = request.MarksObtained;
            answer.EvaluatorRemarks = request.EvaluatorRemarks;
            answer.EvaluationStatus = "Evaluated";
            answer.EvaluatedById = request.EvaluatedByUserId;
            answer.EvaluatedAt = DateTime.UtcNow;

            // The EF change tracker's identity map resolves `answer` to the same instance inside
            // session.Answers below, so its just-set MarksObtained/EvaluationStatus are already reflected.
            var session = await db.CandidateExamSessions
                .Include(s => s.Answers)
                .FirstAsync(s => s.Id == answer.CandidateExamSessionId, cancellationToken);

            session.TotalScore = session.Answers.Sum(a => a.MarksObtained);
            session.Percentage = session.TotalMarks > 0 ? Math.Round(session.TotalScore / session.TotalMarks * 100, 2) : 0;

            var pendingCount = session.Answers.Count(a => a.EvaluationStatus == "Pending");
            session.EvaluationStatus = pendingCount == 0 ? "FullyEvaluated" : "PartiallyEvaluated";

            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
