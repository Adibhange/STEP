using System;
using System.Collections.Generic;
using STEP.Domain.Common;
using STEP.Domain.Entities.Identity;

namespace STEP.Domain.Entities.Vacancy
{
    /// <summary>
    /// Strict locking rules:
    ///   Draft     — editable, upload/delete questions freely.
    ///   Published — READ-ONLY, immutable, no edits/deletes. Requires passing PublishQuestionPaperCommand's
    ///               validation checklist. Safe to assign to candidate exam sessions.
    ///   Archived  — unavailable for new candidate assignments; existing snapshots keep working.
    /// </summary>
    public class VacancyQuestionPaper : BaseEntity
    {
        public int VacancyId { get; set; }
        public Vacancy Vacancy { get; set; } = null!;

        public string PaperCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int PaperVersion { get; set; } = 1;

        public int TotalQuestions { get; set; }
        public decimal TotalMarks { get; set; }
        public int DurationMinutes { get; set; }
        public decimal PassingPercentage { get; set; }

        /// <summary>Draft / Published / Archived.</summary>
        public string Status { get; set; } = "Draft";
        public DateTime? PublishedAt { get; set; }

        public int? PublishedById { get; set; }
        public User? PublishedBy { get; set; }

        public ICollection<VacancyQuestion> Questions { get; set; } = new List<VacancyQuestion>();
    }
}
