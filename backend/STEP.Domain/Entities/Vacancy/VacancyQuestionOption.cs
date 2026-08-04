using STEP.Domain.Common;

namespace STEP.Domain.Entities.Vacancy
{
    public class VacancyQuestionOption : BaseEntity
    {
        public int VacancyQuestionId { get; set; }
        public VacancyQuestion VacancyQuestion { get; set; } = null!;

        /// <summary>A / B / C / D.</summary>
        public string OptionLabel { get; set; } = string.Empty;
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}
