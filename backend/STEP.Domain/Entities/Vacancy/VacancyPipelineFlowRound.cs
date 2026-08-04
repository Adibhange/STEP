using System.Collections.Generic;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Vacancy
{
    /// <summary>
    /// One ordered round within a pipeline flow version (e.g. Round 1: Aptitude, Round 2: Technical).
    /// <see cref="CandidatePipelineProgress"/> (Phase 3) orders a candidate's journey by RoundOrder.
    /// </summary>
    public class VacancyPipelineFlowRound : BaseEntity
    {
        public int VacancyPipelineFlowId { get; set; }
        public VacancyPipelineFlow VacancyPipelineFlow { get; set; } = null!;

        public int RoundOrder { get; set; }
        public string Name { get; set; } = string.Empty;

        /// <summary>Aptitude / Technical / F2F / HR / GroupDiscussion.</summary>
        public string RoundType { get; set; } = string.Empty;

        public decimal CutoffPercent { get; set; }

        public ICollection<VacancyRoundAssessment> RoundAssessments { get; set; } = new List<VacancyRoundAssessment>();
    }
}
