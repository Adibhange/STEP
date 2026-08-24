using System;
using System.Collections.Generic;
using STEP.Domain.Entities.Candidate;
using STEP.Domain.Entities.Identity;
using STEP.Domain.Entities.Master;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Domain.Entities.Exam
{
    /// <summary>
    /// V2 Candidate Exam Session entity (lives under isolated "examv2" schema).
    /// </summary>
    public class CandidateExamSessionV2
    {
        public int Id { get; set; }
        public string SessionToken { get; set; } = string.Empty;
        public int CandidateId { get; set; }
        public CandidateEntity Candidate { get; set; } = null!;

        public int VacancyId { get; set; }
        public VacancyEntity Vacancy { get; set; } = null!;

        public int AssessmentBlueprintId { get; set; }
        public AssessmentBlueprint AssessmentBlueprint { get; set; } = null!;

        public int? CandidatePipelineProgressId { get; set; }
        public CandidatePipelineProgress? CandidatePipelineProgress { get; set; }

        public string CandidateTier { get; set; } = "Fresher";
        public string RolePrimaryLanguage { get; set; } = "C# (.NET)";

        public string SessionStatus { get; set; } = "Created"; // Created, InProgress, Submitted, AutoSubmitted, TerminatedForCheating, Evaluated
        public string EvaluationStatus { get; set; } = "Pending"; // Pending, AutoGraded, Published

        public DateTimeOffset? StartedAt { get; set; }
        public DateTimeOffset? SubmittedAt { get; set; }
        public DateTimeOffset? EvaluatedAt { get; set; }

        public int TotalDurationMinutes { get; set; }
        public int TotalTimeLeftSeconds { get; set; }
        public string? LockedSectionIdsCsv { get; set; }
        public int TabSwitchWarningCount { get; set; }
        public decimal AssessmentIntegrityScore { get; set; } = 100.00m;

        public decimal TotalMarks { get; set; }
        public decimal TotalScore { get; set; }
        public decimal Percentage { get; set; }
        public decimal PassingPercentage { get; set; } = 70.00m;
        public string ResultStatus { get; set; } = "Pending"; // Pending, Pass, Fail

        public int? EvaluatorUserId { get; set; }
        public User? EvaluatorUser { get; set; }
        public string? EvaluatorRemarks { get; set; }
        public byte[]? RowVersion { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

        public ICollection<CandidateExamSessionQuestionV2> Questions { get; set; } = new List<CandidateExamSessionQuestionV2>();
        public ICollection<CandidateExamAnswerV2> Answers { get; set; } = new List<CandidateExamAnswerV2>();
        public ICollection<ExamProctoringLog> ProctoringLogs { get; set; } = new List<ExamProctoringLog>();
    }

    public class CandidateExamSessionQuestionV2
    {
        public int Id { get; set; }
        public int CandidateExamSessionId { get; set; }
        public CandidateExamSessionV2 CandidateExamSession { get; set; } = null!;

        public int SectionRuleId { get; set; }
        public AssessmentBlueprintSectionRule SectionRule { get; set; } = null!;

        public int OriginalMasterQuestionId { get; set; }
        public MasterQuestion OriginalMasterQuestion { get; set; } = null!;

        public string SectionName { get; set; } = string.Empty;
        public string SectionType { get; set; } = "TechnicalMCQ";
        public string QuestionType { get; set; } = "SINGLE_CHOICE";
        public int DisplayOrder { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public decimal Marks { get; set; } = 1.00m;
        public int? TimeAllowedMinutes { get; set; }
        public string? ProgrammingLanguage { get; set; }
        public string? SqlSchema { get; set; }
        public string QuestionSnapshotJson { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        public ICollection<CandidateExamSessionQuestionOptionV2> Options { get; set; } = new List<CandidateExamSessionQuestionOptionV2>();
    }

    public class CandidateExamSessionQuestionOptionV2
    {
        public int Id { get; set; }
        public int CandidateExamSessionQuestionId { get; set; }
        public CandidateExamSessionQuestionV2 CandidateExamSessionQuestion { get; set; } = null!;

        public int OriginalMasterQuestionOptionId { get; set; }
        public MasterQuestionOption OriginalMasterQuestionOption { get; set; } = null!;

        public string DisplayOptionLabel { get; set; } = "A";
        public int DisplayOrder { get; set; }
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }

    public class CandidateExamAnswerV2
    {
        public int Id { get; set; }
        public int CandidateExamSessionId { get; set; }
        public CandidateExamSessionV2 CandidateExamSession { get; set; } = null!;

        public int CandidateExamSessionQuestionId { get; set; }
        public CandidateExamSessionQuestionV2 CandidateExamSessionQuestion { get; set; } = null!;

        public string? SubmittedAnswerText { get; set; }
        public decimal MarksObtained { get; set; }
        public string EvaluationStatus { get; set; } = "Pending";
        public bool EvaluationLocked { get; set; }
        public string? EvaluatorRemarks { get; set; }
        public DateTimeOffset? AnsweredAt { get; set; }

        public ICollection<CandidateExamAnswerOptionV2> SelectedOptions { get; set; } = new List<CandidateExamAnswerOptionV2>();
    }

    public class CandidateExamAnswerOptionV2
    {
        public int Id { get; set; }
        public int CandidateExamAnswerId { get; set; }
        public CandidateExamAnswerV2 CandidateExamAnswer { get; set; } = null!;

        public int CandidateExamSessionQuestionOptionId { get; set; }
        public CandidateExamSessionQuestionOptionV2 CandidateExamSessionQuestionOption { get; set; } = null!;
    }

    public class ExamProctoringLog
    {
        public int Id { get; set; }
        public int CandidateExamSessionId { get; set; }
        public CandidateExamSessionV2 CandidateExamSession { get; set; } = null!;

        public string EventType { get; set; } = "TabSwitch";
        public string? ClientIp { get; set; }
        public string? UserAgent { get; set; }
        public string? Metadata { get; set; }
        public DateTimeOffset LoggedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
