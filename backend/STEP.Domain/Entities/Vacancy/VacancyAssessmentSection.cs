using STEP.Domain.Common;

namespace STEP.Domain.Entities.Vacancy
{
    /// <summary>
    /// Vacancy-owned assessment pattern row (Step 3 of the creation wizard): "MCQ — 20 questions,
    /// 25 minutes, 2 marks each". Drives the shape of the generated Excel question-bank template.
    /// </summary>
    public class VacancyAssessmentSection : BaseEntity
    {
        public int VacancyId { get; set; }
        public Vacancy Vacancy { get; set; } = null!;

        public int SectionOrder { get; set; }
        public string SectionTitle { get; set; } = string.Empty;
        public int TotalQuestions { get; set; }
        public int TimeLimitMinutes { get; set; }
        public decimal MarksPerQuestion { get; set; }
        public decimal TotalMarks { get; set; }
    }
}
