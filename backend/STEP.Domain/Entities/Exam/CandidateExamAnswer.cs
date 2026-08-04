using System;
using System.Collections.Generic;
using STEP.Domain.Common;
using STEP.Domain.Entities.Identity;

namespace STEP.Domain.Entities.Exam
{
    /// <summary>
    /// One row per question the candidate answered (or left blank). EvaluationLocked flips to true
    /// only inside PublishAssessmentResultCommand — from that point the row is permanently read-only.
    /// </summary>
    public class CandidateExamAnswer : BaseEntity
    {
        public int CandidateExamSessionId { get; set; }
        public CandidateExamSession CandidateExamSession { get; set; } = null!;

        public int CandidateExamSessionQuestionId { get; set; }
        public CandidateExamSessionQuestion CandidateExamSessionQuestion { get; set; } = null!;

        /// <summary>Max marks, copied from the snapshot question at answer-save time.</summary>
        public decimal Marks { get; set; }

        /// <summary>Submitted SQL query / code / essay text — null for MCQ answers (see SelectedOptions).</summary>
        public string? SubmittedAnswerText { get; set; }

        public decimal MarksObtained { get; set; } = 0;

        /// <summary>Pending / InReview / Evaluated / Published.</summary>
        public string EvaluationStatus { get; set; } = "Pending";
        public bool EvaluationLocked { get; set; } = false;
        public string? EvaluatorRemarks { get; set; }

        public int? EvaluatedById { get; set; }
        public User? EvaluatedBy { get; set; }
        public DateTime? EvaluatedAt { get; set; }

        public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;

        public ICollection<CandidateExamAnswerOption> SelectedOptions { get; set; } = new List<CandidateExamAnswerOption>();
    }
}
