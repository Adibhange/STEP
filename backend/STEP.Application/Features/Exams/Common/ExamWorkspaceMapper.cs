using System.Linq;
using STEP.Domain.Entities.Exam;

namespace STEP.Application.Features.Exams.Common
{
    /// <summary>Shared by StartExamSessionCommand and ResumeExamSessionQuery so both return an identical shape.</summary>
    public static class ExamWorkspaceMapper
    {
        public static LiveExamWorkspaceDto ToWorkspaceDto(CandidateExamSession session)
        {
            var answersByQuestionId = session.Answers.ToDictionary(a => a.CandidateExamSessionQuestionId);

            var questions = session.Questions
                .OrderBy(q => q.DisplayOrder)
                .Select(q =>
                {
                    answersByQuestionId.TryGetValue(q.Id, out var answer);
                    var selectedOptionIds = answer?.SelectedOptions.Select(o => o.CandidateExamSessionQuestionOptionId).ToList() ?? [];

                    return new ExamQuestionDto(
                        q.Id, q.DisplayOrder, q.QuestionType, q.QuestionText, q.Marks, q.TimeAllowedMinutes,
                        q.ProgrammingLanguage, q.SqlSchema, q.MaxWordCount,
                        q.Options.OrderBy(o => o.DisplayOrder).Select(o => new ExamOptionDto(o.Id, o.DisplayOptionLabel, o.OptionText)).ToList(),
                        answer?.SubmittedAnswerText,
                        selectedOptionIds);
                })
                .ToList();

            return new LiveExamWorkspaceDto(
                session.SessionToken,
                session.SnapshotCandidateName,
                session.SnapshotVacancyTitle,
                session.SnapshotPaperTitle,
                session.FrozenTotalDurationMinutes,
                session.TotalTimeLeftSeconds,
                session.ActiveQuestionIndex,
                session.SessionStatus,
                questions);
        }

        public static LiveExamWorkspaceDto ToWorkspaceDto(CandidateExamSessionV2 session)
        {
            var answersByQuestionId = session.Answers.ToDictionary(a => a.CandidateExamSessionQuestionId);

            var questions = session.Questions
                .OrderBy(q => q.DisplayOrder)
                .Select(q =>
                {
                    answersByQuestionId.TryGetValue(q.Id, out var answer);
                    var selectedOptionIds = answer?.SelectedOptions.Select(o => o.CandidateExamSessionQuestionOptionId).ToList() ?? [];

                    return new ExamQuestionDto(
                        q.Id, q.DisplayOrder, q.QuestionType, q.QuestionText, q.Marks, q.TimeAllowedMinutes,
                        q.ProgrammingLanguage, q.SqlSchema, null,
                        q.Options.OrderBy(o => o.DisplayOrder).Select(o => new ExamOptionDto(o.Id, o.DisplayOptionLabel, o.OptionText)).ToList(),
                        answer?.SubmittedAnswerText,
                        selectedOptionIds);
                })
                .ToList();

            var candidateName = session.Candidate != null ? $"{session.Candidate.FirstName} {session.Candidate.LastName}".Trim() : "Candidate";
            var vacancyTitle = session.Vacancy?.Title ?? "Assessment";
            var paperTitle = session.AssessmentBlueprint?.Name ?? "Technical Assessment";

            return new LiveExamWorkspaceDto(
                session.SessionToken,
                candidateName,
                vacancyTitle,
                paperTitle,
                session.TotalDurationMinutes,
                session.TotalTimeLeftSeconds,
                0,
                session.SessionStatus,
                questions);
        }
    }
}
