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
            // 1. Try V2 Session
            var sessionV2 = await db.CandidateExamSessionsV2
                .Include(s => s.Candidate)
                .Include(s => s.Vacancy)
                .Include(s => s.AssessmentBlueprint)
                .Include(s => s.Answers).ThenInclude(a => a.CandidateExamSessionQuestion).ThenInclude(q => q.Options)
                .Include(s => s.Answers).ThenInclude(a => a.SelectedOptions)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == request.CandidateExamSessionId, cancellationToken);

            if (sessionV2 != null)
            {
                var answersV2 = sessionV2.Answers
                    .OrderBy(a => a.CandidateExamSessionQuestion.DisplayOrder)
                    .Select(a => new ExamAnswerEvaluationDto(
                        a.Id,
                        a.CandidateExamSessionQuestion.DisplayOrder,
                        a.CandidateExamSessionQuestion.QuestionType,
                        a.CandidateExamSessionQuestion.QuestionText,
                        a.SubmittedAnswerText,
                        a.CandidateExamSessionQuestion.Marks,
                        a.MarksObtained,
                        a.EvaluationStatus,
                        a.EvaluationLocked,
                        a.EvaluatorRemarks,
                        a.CandidateExamSessionQuestion.Options
                            .OrderBy(o => o.DisplayOrder)
                            .Select(o => new EvaluationOptionDto(o.Id, o.DisplayOptionLabel, o.OptionText, o.IsCorrect))
                            .ToList(),
                        a.SelectedOptions.Select(so => so.CandidateExamSessionQuestionOptionId).ToList(),
                        a.CandidateExamSessionQuestion.SectionName))
                    .ToList();

                var candName = $"{sessionV2.Candidate.FirstName} {sessionV2.Candidate.LastName}".Trim();
                var vacTitle = sessionV2.Vacancy?.Title ?? "Engineering Role";
                var paperTitle = sessionV2.AssessmentBlueprint?.Name ?? "Assessment";

                return new ExamEvaluationViewDto(
                    sessionV2.Id,
                    candName,
                    vacTitle,
                    paperTitle,
                    sessionV2.SessionStatus,
                    sessionV2.EvaluationStatus,
                    sessionV2.TotalMarks,
                    sessionV2.TotalScore,
                    sessionV2.TotalDurationMinutes,
                    sessionV2.StartedAt?.UtcDateTime,
                    sessionV2.SubmittedAt?.UtcDateTime,
                    sessionV2.TabSwitchWarningCount,
                    sessionV2.AssessmentIntegrityScore,
                    answersV2);
            }

            // 2. Fallback to V1 Session
            var session = await db.CandidateExamSessions
                .Include(s => s.Answers).ThenInclude(a => a.CandidateExamSessionQuestion).ThenInclude(q => q.Options)
                .Include(s => s.Answers).ThenInclude(a => a.SelectedOptions)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == request.CandidateExamSessionId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateExamSession), request.CandidateExamSessionId);

            var answers = session.Answers
                .OrderBy(a => a.CandidateExamSessionQuestion.DisplayOrder)
                .Select(a => new ExamAnswerEvaluationDto(
                    a.Id, a.CandidateExamSessionQuestion.DisplayOrder, a.CandidateExamSessionQuestion.QuestionType,
                    a.CandidateExamSessionQuestion.QuestionText, a.SubmittedAnswerText, a.Marks, a.MarksObtained,
                    a.EvaluationStatus, a.EvaluationLocked, a.EvaluatorRemarks,
                    a.CandidateExamSessionQuestion.Options
                        .OrderBy(o => o.DisplayOrder)
                        .Select(o => new EvaluationOptionDto(o.Id, o.DisplayOptionLabel, o.OptionText, o.IsCorrect))
                        .ToList(),
                    a.SelectedOptions.Select(so => so.CandidateExamSessionQuestionOptionId).ToList(),
                    a.CandidateExamSessionQuestion.SectionName))
                .ToList();

            return new ExamEvaluationViewDto(
                session.Id, session.SnapshotCandidateName, session.SnapshotVacancyTitle, session.SnapshotPaperTitle,
                session.SessionStatus, session.EvaluationStatus, session.TotalMarks, session.TotalScore,
                session.FrozenTotalDurationMinutes, session.StartedAt, session.SubmittedAt,
                session.TabSwitchWarnings, session.AssessmentIntegrityScore, answers);
        }
    }
}
