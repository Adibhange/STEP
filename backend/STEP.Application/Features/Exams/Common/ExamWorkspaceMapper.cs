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
                questions,
                session.Id,
                false, // RequireCameraAndMic (V1 tests)
                null,  // RoundNumber
                "Online"); // TestMode
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

            int? roundNumber = session.CandidatePipelineProgress?.RoundNumber;

            // Video and microphone validation is ONLY for Direct Vacancies AND ONLY with explicit HR permission for tests taken from home.
            // Walk-in candidates take their exam on-site in the office and NEVER require camera or microphone validation.
            var isDirectVacancy = (session.Vacancy?.DriveType?.Contains("Direct", StringComparison.OrdinalIgnoreCase) ?? false)
                || session.Candidate?.RegistrationChannel == "Direct Sourced";

            var assessmentMode = session.CandidatePipelineProgress?.AssessmentMode;
            var hasHrHomeTestPermission = isDirectVacancy && !string.IsNullOrWhiteSpace(assessmentMode) &&
                (assessmentMode.Equals("From Home", StringComparison.OrdinalIgnoreCase)
                 || assessmentMode.Contains("Home", StringComparison.OrdinalIgnoreCase)
                 || assessmentMode.Contains("Remote", StringComparison.OrdinalIgnoreCase));

            bool requireCameraAndMic = isDirectVacancy && hasHrHomeTestPermission;
            string effectiveMode = hasHrHomeTestPermission ? "Remote (From Home)" : "In Office";

            return new LiveExamWorkspaceDto(
                session.SessionToken,
                candidateName,
                vacancyTitle,
                paperTitle,
                session.TotalDurationMinutes,
                session.TotalTimeLeftSeconds,
                0,
                session.SessionStatus,
                questions,
                session.Id,
                requireCameraAndMic,
                roundNumber,
                effectiveMode);
        }
    }
}
