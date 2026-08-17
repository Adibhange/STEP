using STEP.Domain.Common;

namespace STEP.Domain.Entities.Master
{
    /// <summary>
    /// Relational assessment section rule belonging to a RoleHiringProfile.
    /// Dictates what section question count, types, tags, difficulty, and duration the dynamic sampler selects.
    /// </summary>
    public class RoleAssessmentSectionRule : BaseEntity
    {
        public int RoleHiringProfileId { get; set; }
        public RoleHiringProfile RoleHiringProfile { get; set; } = null!;

        public string SectionName { get; set; } = string.Empty;

        /// <summary>Aptitude / TechnicalMCQ / Coding / SQLQuery / SubjectiveTheory.</summary>
        public string SectionType { get; set; } = "TechnicalMCQ";

        /// <summary>SINGLE_CHOICE / MULTI_CHOICE / CODING / SQL / SUBJECTIVE.</summary>
        public string QuestionType { get; set; } = "SINGLE_CHOICE";

        /// <summary>Easy / Medium / Hard / Any.</summary>
        public string Difficulty { get; set; } = "Any";

        /// <summary>Required tags (e.g. "React,Hooks" or "SQL,Joins" or "Logical").</summary>
        public string RequiredTags { get; set; } = string.Empty;

        public int QuestionCount { get; set; } = 10;
        public decimal MarksPerQuestion { get; set; } = 1.0m;
        public int? TimeLimitMinutes { get; set; }

        public string? ProgrammingLanguage { get; set; }

        /// <summary>RandomShuffled / WeightedDifficulty / Fixed / AIGenerated.</summary>
        public string SelectionStrategy { get; set; } = "RandomShuffled";

        public int DisplayOrder { get; set; } = 1;
        public bool IsActive { get; set; } = true;
    }
}
