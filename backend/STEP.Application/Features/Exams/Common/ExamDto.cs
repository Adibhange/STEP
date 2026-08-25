using System;
using System.Collections.Generic;

namespace STEP.Application.Features.Exams.Common
{
    /// <summary>Candidate-facing option — IsCorrect is never included in this DTO.</summary>
    public record ExamOptionDto(int Id, string Label, string Text);

    public record ExamQuestionDto(
        int Id,
        int DisplayOrder,
        string QuestionType,
        string QuestionText,
        decimal Marks,
        int? TimeAllowedMinutes,
        string? ProgrammingLanguage,
        string? SqlSchema,
        int? MaxWordCount,
        List<ExamOptionDto> Options,
        string? SubmittedAnswerText,
        List<int> SelectedOptionIds);

    public record LiveExamWorkspaceDto(
        string SessionToken,
        string CandidateName,
        string VacancyTitle,
        string PaperTitle,
        int DurationMinutes,
        int TotalTimeLeftSeconds,
        int ActiveQuestionIndex,
        string SessionStatus,
        List<ExamQuestionDto> Questions,
        int? CandidateExamSessionId = null);

    public record SubmitExamResultDto(string SessionStatus, decimal TotalScore, decimal TotalMarks, int PendingManualEvaluationCount);

    /// <summary>Evaluator-facing option — unlike ExamOptionDto, IsCorrect is included here since an
    /// evaluator legitimately needs to see which option was right; never reuse this for the
    /// candidate-facing exam-taking API.</summary>
    public record EvaluationOptionDto(int Id, string Label, string Text, bool IsCorrect);

    public record ExamAnswerEvaluationDto(
        int CandidateExamAnswerId,
        int QuestionDisplayOrder,
        string QuestionType,
        string QuestionText,
        string? SubmittedAnswerText,
        decimal Marks,
        decimal MarksObtained,
        string EvaluationStatus,
        bool EvaluationLocked,
        string? EvaluatorRemarks,
        List<EvaluationOptionDto> Options,
        List<int> SelectedOptionIds,
        string? SectionName = null,
        int CandidateExamSessionQuestionId = 0);

    public record ExamEvaluationViewDto(
        int CandidateExamSessionId,
        string CandidateName,
        string VacancyTitle,
        string PaperTitle,
        string SessionStatus,
        string EvaluationStatus,
        decimal TotalMarks,
        decimal TotalScore,
        int FrozenTotalDurationMinutes,
        DateTime? StartedAt,
        DateTime? SubmittedAt,
        int TabSwitchWarnings,
        decimal AssessmentIntegrityScore,
        List<ExamAnswerEvaluationDto> Answers);

    public record PublishResultDto(
        int CandidateExamSessionId,
        string ResultStatus,
        decimal TotalScore,
        decimal TotalMarks,
        decimal Percentage,
        bool AdvancedToNextRound,
        string? NextRoundTitle,
        string? NextRoundExamPasscode,
        string CandidateStatus);
}
