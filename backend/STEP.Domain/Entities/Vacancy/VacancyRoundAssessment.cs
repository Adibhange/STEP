using STEP.Domain.Common;

namespace STEP.Domain.Entities.Vacancy
{
    /// <summary>
    /// Decoupled round-assessment link: which published question paper (if any) is used to
    /// evaluate a given pipeline round. Decoupled so a paper can be swapped without touching
    /// the pipeline flow definition itself.
    /// </summary>
    public class VacancyRoundAssessment : BaseEntity
    {
        public int VacancyPipelineFlowRoundId { get; set; }
        public VacancyPipelineFlowRound VacancyPipelineFlowRound { get; set; } = null!;

        public int? VacancyQuestionPaperId { get; set; }
        public VacancyQuestionPaper? VacancyQuestionPaper { get; set; }
    }
}
