using System;
using STEP.Domain.Common;
using STEP.Domain.Entities.Identity;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Domain.Entities.Candidate
{
    /// <summary>
    /// One row per round a candidate has been assigned to. The full set is created when a
    /// pipeline flow is assigned to the candidate; ORDER BY RoundNumber ASC gives the timeline —
    /// no linked-list traversal needed. Candidate.CurrentPipelineProgressId points to whichever
    /// row is currently active.
    /// </summary>
    public class CandidatePipelineProgress : BaseEntity
    {
        public int CandidateId { get; set; }
        public Candidate Candidate { get; set; } = null!;

        public int VacancyPipelineFlowRoundId { get; set; }
        public VacancyPipelineFlowRound VacancyPipelineFlowRound { get; set; } = null!;

        public int RoundNumber { get; set; }
        public string RoundTitle { get; set; } = string.Empty;

        /// <summary>Assessment / Interview.</summary>
        public string RoundType { get; set; } = string.Empty;

        /// <summary>Assigned / InProgress / Passed / Failed / Waived.</summary>
        public string Status { get; set; } = "Assigned";

        public decimal? ScoreObtained { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? EvaluatedAt { get; set; }

        public int? EvaluatorId { get; set; }
        public User? Evaluator { get; set; }

        public int? SkippedById { get; set; }
        public User? SkippedBy { get; set; }
        public string? SkipReason { get; set; }

        public string? Remarks { get; set; }

        public DateTime? ScheduledTestDate { get; set; }
        public DateTime? ScheduledStartTimeUtc { get; set; }
        public DateTime? ScheduledEndTimeUtc { get; set; }
        public string? AssessmentMode { get; set; }
        public string? TestPasscode { get; set; }
    }
}
