using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Exams.Common;
using STEP.Domain.Entities.Exam;

namespace STEP.Application.Features.Exams.Queries.GetExamEvaluationView
{
    public class GetExamEvaluationViewQueryHandler(IApplicationDbContext db) : IRequestHandler<GetExamEvaluationViewQuery, ExamEvaluationViewDto>
    {
        public async Task<ExamEvaluationViewDto> Handle(GetExamEvaluationViewQuery request, CancellationToken cancellationToken)
        {
            var session = await db.CandidateExamSessions
                .Include(s => s.Answers).ThenInclude(a => a.CandidateExamSessionQuestion)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == request.CandidateExamSessionId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateExamSession), request.CandidateExamSessionId);

            var answers = session.Answers
                .OrderBy(a => a.CandidateExamSessionQuestion.DisplayOrder)
                .Select(a => new ExamAnswerEvaluationDto(
                    a.Id, a.CandidateExamSessionQuestion.DisplayOrder, a.CandidateExamSessionQuestion.QuestionType,
                    a.CandidateExamSessionQuestion.QuestionText, a.SubmittedAnswerText, a.Marks, a.MarksObtained,
                    a.EvaluationStatus, a.EvaluationLocked, a.EvaluatorRemarks))
                .ToList();

            return new ExamEvaluationViewDto(
                session.Id, session.SnapshotCandidateName, session.SnapshotVacancyTitle, session.SnapshotPaperTitle,
                session.SessionStatus, session.EvaluationStatus, session.TotalMarks, session.TotalScore, answers);
        }
    }
}
