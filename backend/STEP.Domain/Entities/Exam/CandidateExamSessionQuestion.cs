using System.Collections.Generic;
using STEP.Domain.Common;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Domain.Entities.Exam
{
    /// <summary>
    /// A frozen copy of one question as it appeared to this candidate — display order may differ
    /// from the original paper order (shuffle), but QuestionSnapshotJson preserves the complete
    /// original payload regardless of later edits to the live VacancyQuestion.
    /// </summary>
    public class CandidateExamSessionQuestion : BaseEntity
    {
        public int CandidateExamSessionId { get; set; }
        public CandidateExamSession CandidateExamSession { get; set; } = null!;

        public int OriginalVacancyQuestionId { get; set; }
        public VacancyQuestion OriginalVacancyQuestion { get; set; } = null!;
        public int OriginalQuestionVersion { get; set; } = 1;

        public int DisplayOrder { get; set; }
        public int OriginalOrder { get; set; }

        public string QuestionType { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public decimal Marks { get; set; }
        public int? TimeAllowedMinutes { get; set; }
        public string? ProgrammingLanguage { get; set; }
        public string? SqlSchema { get; set; }
        public int? MaxWordCount { get; set; }

        /// <summary>Complete serialized question payload (including options) — the source of truth for rendering, independent of later edits upstream.</summary>
        public string QuestionSnapshotJson { get; set; } = string.Empty;

        public ICollection<CandidateExamSessionQuestionOption> Options { get; set; } = new List<CandidateExamSessionQuestionOption>();
    }
}
