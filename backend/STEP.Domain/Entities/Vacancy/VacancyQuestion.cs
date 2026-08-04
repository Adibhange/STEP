using System.Collections.Generic;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Vacancy
{
    /// <summary>
    /// A single question inside a (Draft) question paper. QuestionType drives which optional
    /// fields are meaningful: SINGLE_CHOICE/MULTI_CHOICE use Options; CODING uses ProgrammingLanguage;
    /// SQL uses SqlSchema; SUBJECTIVE uses MaxWordCount. Matches the Excel import worksheet shape
    /// (frontend/src/features/vacancies/utils/excelGenerator.ts).
    /// </summary>
    public class VacancyQuestion : BaseEntity
    {
        public int VacancyQuestionPaperId { get; set; }
        public VacancyQuestionPaper VacancyQuestionPaper { get; set; } = null!;

        public int? VacancyAssessmentSectionId { get; set; }
        public VacancyAssessmentSection? VacancyAssessmentSection { get; set; }

        public int QuestionNumber { get; set; }
        public int Version { get; set; } = 1;

        /// <summary>SINGLE_CHOICE / MULTI_CHOICE / CODING / SQL / SUBJECTIVE.</summary>
        public string QuestionType { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public decimal Marks { get; set; }
        public int? TimeAllowedMinutes { get; set; }

        public string? ProgrammingLanguage { get; set; }
        public string? SqlSchema { get; set; }
        public int? MaxWordCount { get; set; }

        public ICollection<VacancyQuestionOption> Options { get; set; } = new List<VacancyQuestionOption>();
    }
}
