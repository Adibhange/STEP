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
            // 1. Try V2 Answer
            var answerV2 = await db.CandidateExamAnswersV2
                .Include(a => a.CandidateExamSessionQuestion)
                .Include(a => a.CandidateExamSession).ThenInclude(s => s.Answers)
                .FirstOrDefaultAsync(a => a.Id == request.CandidateExamAnswerId, cancellationToken);

            if (answerV2 != null)
            {
                if (answerV2.EvaluationLocked)
                {
                    throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(answerV2.EvaluationLocked),
                        "This answer has already been published and is locked.")]);
                }

                var maxMarks = answerV2.CandidateExamSessionQuestion.Marks;
                if (request.MarksObtained > maxMarks)
                {
                    throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.MarksObtained),
                        $"MarksObtained ({request.MarksObtained}) cannot exceed the question's max marks ({maxMarks}).")]);
                }

                answerV2.MarksObtained = request.MarksObtained;
                answerV2.EvaluatorRemarks = request.EvaluatorRemarks;
                answerV2.EvaluationStatus = "Evaluated";
                answerV2.AnsweredAt ??= DateTimeOffset.UtcNow;

                var sessionV2 = answerV2.CandidateExamSession;
                sessionV2.TotalScore = sessionV2.Answers.Sum(a => a.MarksObtained);
                sessionV2.Percentage = sessionV2.TotalMarks > 0 ? Math.Round(sessionV2.TotalScore / sessionV2.TotalMarks * 100, 2) : 0;
                sessionV2.ResultStatus = sessionV2.Percentage >= sessionV2.PassingPercentage ? "Pass" : "Fail";

                var pendingCount = sessionV2.Answers.Count(a => a.EvaluationStatus == "Pending");
                sessionV2.EvaluationStatus = pendingCount == 0 ? "Published" : "PartiallyEvaluated";

                if (pendingCount == 0 && sessionV2.CandidatePipelineProgressId.HasValue)
                {
                    var prog = await db.CandidatePipelineProgresses.FirstOrDefaultAsync(p => p.Id == sessionV2.CandidatePipelineProgressId.Value, cancellationToken);
                    if (prog != null)
                    {
                        prog.ScoreObtained = sessionV2.Percentage;
                        prog.Status = sessionV2.ResultStatus == "Pass" ? "Passed" : "Failed";
                        prog.CompletedAt = DateTime.UtcNow;
                    }
                }

                await db.SaveChangesAsync(cancellationToken);
                return true;
            }

            // 2. Fallback to V1 Answer
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

            var session = await db.CandidateExamSessions
                .Include(s => s.Answers)
                .FirstAsync(s => s.Id == answer.CandidateExamSessionId, cancellationToken);

            session.TotalScore = session.Answers.Sum(a => a.MarksObtained);
            session.Percentage = session.TotalMarks > 0 ? Math.Round(session.TotalScore / session.TotalMarks * 100, 2) : 0;

            var v1PendingCount = session.Answers.Count(a => a.EvaluationStatus == "Pending");
            session.EvaluationStatus = v1PendingCount == 0 ? "FullyEvaluated" : "PartiallyEvaluated";

            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
