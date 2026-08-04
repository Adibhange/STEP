using STEP.Domain.Common;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Domain.Entities.Exam
{
    public class CandidateExamSessionQuestionOption : BaseEntity
    {
        public int CandidateExamSessionQuestionId { get; set; }
        public CandidateExamSessionQuestion CandidateExamSessionQuestion { get; set; } = null!;

        public int OriginalVacancyQuestionOptionId { get; set; }
        public VacancyQuestionOption OriginalVacancyQuestionOption { get; set; } = null!;

        public int DisplayOrder { get; set; }
        public int OriginalOrder { get; set; }
        /// <summary>A/B/C/D re-assigned to match DisplayOrder after shuffling.</summary>
        public string DisplayOptionLabel { get; set; } = string.Empty;
        public string OptionText { get; set; } = string.Empty;

        /// <summary>Never exposed to the candidate-facing API — used only by auto-evaluation.</summary>
        public bool IsCorrect { get; set; }
    }
}
