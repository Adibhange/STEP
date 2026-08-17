using System.Collections.Generic;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Master
{
    /// <summary>
    /// Central enterprise Question Bank entity tagged by role, section type, difficulty, and keywords.
    /// Used by the V2 Dynamic Question Sampler to assemble randomized candidate-specific snapshots.
    /// </summary>
    public class MasterQuestion : BaseEntity
    {
        public int? MasterRoleId { get; set; }
        public MasterRole? MasterRole { get; set; }

        /// <summary>Aptitude / TechnicalMCQ / Coding / SQLQuery / SubjectiveTheory.</summary>
        public string SectionType { get; set; } = "TechnicalMCQ";

        /// <summary>SINGLE_CHOICE / MULTI_CHOICE / CODING / SQL / SUBJECTIVE.</summary>
        public string QuestionType { get; set; } = "SINGLE_CHOICE";

        /// <summary>Easy / Medium / Hard / Expert.</summary>
        public string Difficulty { get; set; } = "Medium";

        /// <summary>Fresher / Junior / Mid / Senior.</summary>
        public string ExperienceLevel { get; set; } = "Fresher";

        /// <summary>Comma-separated searchable topic tags (e.g. "React,Hooks,State" or "SQL,Joins,Grouping").</summary>
        public string Tags { get; set; } = string.Empty;

        public string QuestionText { get; set; } = string.Empty;
        public decimal Marks { get; set; } = 1.0m;
        public int? TimeAllowedMinutes { get; set; }

        public string? ProgrammingLanguage { get; set; }
        public string? SqlSchema { get; set; }
        public int? MaxWordCount { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<MasterQuestionOption> Options { get; set; } = new List<MasterQuestionOption>();
    }
}
