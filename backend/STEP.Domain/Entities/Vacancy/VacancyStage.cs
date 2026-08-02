using STEP.Domain.Common;

namespace STEP.Domain.Entities.Vacancy
{
    public class VacancyStage : BaseEntity
    {
        public int VacancyId { get; set; }
        public Vacancy? Vacancy { get; set; }

        public int StageOrder { get; set; }
        public string StageName { get; set; } = string.Empty; // e.g. Aptitude, Technical, Machine Test, F2F, HR, Director
        public string StageType { get; set; } = string.Empty; // Assessment, Technical, Managerial, Director, HR
        public decimal? PassMarkPercentage { get; set; }
        public bool IsMandatory { get; set; } = true;
    }
}
