using System;
using System.Collections.Generic;
using STEP.Domain.Common;
using STEP.Domain.Entities.Candidate;
using STEP.Domain.Entities.Identity;
using STEP.Domain.Entities.Vacancy;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;

namespace STEP.Domain.Entities.Exam
{
    /// <summary>
    /// Complete snapshot freeze of one candidate's attempt at one assessment round. Every value a
    /// grader or auditor might need later is frozen here at StartExamSessionCommand time — nothing
    /// is re-derived from the live Vacancy/QuestionPaper configuration after the fact, so later
    /// edits to those never retroactively change what a candidate was actually tested on.
    /// </summary>
    public class CandidateExamSession : BaseEntity
    {
        public int CandidateId { get; set; }
        public CandidateEntity Candidate { get; set; } = null!;

        public int VacancyId { get; set; }
        public VacancyEntity Vacancy { get; set; } = null!;

        /// <summary>Explicit source: "StaticPaper" (V1) or "DynamicQuestionBank" (V2).</summary>
        public string AssessmentSource { get; set; } = "DynamicQuestionBank";

        public int? RoleHiringProfileId { get; set; }
        public STEP.Domain.Entities.Master.RoleHiringProfile? RoleHiringProfile { get; set; }

        public int? VacancyQuestionPaperId { get; set; }
        public VacancyQuestionPaper? VacancyQuestionPaper { get; set; }

        public int? CandidatePipelineProgressId { get; set; }
        public CandidatePipelineProgress? CandidatePipelineProgress { get; set; }

        public string SessionToken { get; set; } = string.Empty;
        public int AttemptNumber { get; set; } = 1;

        /// <summary>Deterministic seed recorded so the exact shuffle order can be reproduced/audited later.</summary>
        public int ShuffleSeed { get; set; }

        // Frozen candidate/vacancy/paper snapshot
        public string SnapshotCandidateName { get; set; } = string.Empty;
        public string SnapshotCandidateCode { get; set; } = string.Empty;
        public string SnapshotVacancyTitle { get; set; } = string.Empty;
        public string SnapshotVacancyCode { get; set; } = string.Empty;
        public string SnapshotPaperCode { get; set; } = string.Empty;
        public string SnapshotPaperTitle { get; set; } = string.Empty;
        public int OriginalPaperVersion { get; set; } = 1;

        // Frozen environment metadata
        /// <summary>Home / Office / Hybrid.</summary>
        public string FrozenAssessmentMode { get; set; } = string.Empty;
        /// <summary>Home / Office.</summary>
        public string TestSource { get; set; } = string.Empty;
        public string? FrozenIPAddress { get; set; }
        public string? FrozenBrowser { get; set; }
        public string? FrozenOS { get; set; }
        public string? FrozenDeviceType { get; set; }

        // Frozen timing & rules snapshot
        public int FrozenTotalDurationMinutes { get; set; }
        public decimal FrozenPassingPercentage { get; set; }
        public bool FrozenShuffleEnabled { get; set; } = true;
        public bool FrozenOptionShuffleEnabled { get; set; } = true;

        /// <summary>Created / Ready / InProgress / Paused / AutoSubmitted / Submitted / Evaluated / Cancelled / Expired.</summary>
        public string SessionStatus { get; set; } = "Created";

        /// <summary>Pending / PartiallyEvaluated / FullyEvaluated / Published.</summary>
        public string EvaluationStatus { get; set; } = "Pending";

        // Frozen result snapshot
        public decimal TotalScore { get; set; } = 0;
        public decimal TotalMarks { get; set; }
        public decimal Percentage { get; set; } = 0;
        /// <summary>Pending / Pass / Fail.</summary>
        public string ResultStatus { get; set; } = "Pending";
        public decimal AssessmentIntegrityScore { get; set; } = 100.00m;
        public int TabSwitchWarnings { get; set; } = 0;

        public int TotalTimeLeftSeconds { get; set; }
        /// <summary>0-based index into Questions (ordered by DisplayOrder) the candidate last had open — drives resume.</summary>
        public int ActiveQuestionIndex { get; set; } = 0;
        public DateTime? StartedAt { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? EvaluatedAt { get; set; }

        public int? EvaluatorId { get; set; }
        public User? Evaluator { get; set; }

        public ICollection<CandidateExamSessionQuestion> Questions { get; set; } = new List<CandidateExamSessionQuestion>();
        public ICollection<CandidateExamAnswer> Answers { get; set; } = new List<CandidateExamAnswer>();
    }
}
