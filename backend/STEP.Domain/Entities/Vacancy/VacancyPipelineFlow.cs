using System.Collections.Generic;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Vacancy
{
    /// <summary>Pipeline flow header ("Track A", "Track B", ...). A Vacancy can have several; exactly one is default.</summary>
    public class VacancyPipelineFlow : BaseEntity
    {
        public int VacancyId { get; set; }
        public Vacancy Vacancy { get; set; } = null!;

        public string VersionName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsDefault { get; set; }

        public ICollection<VacancyPipelineFlowRound> Rounds { get; set; } = new List<VacancyPipelineFlowRound>();
    }
}
