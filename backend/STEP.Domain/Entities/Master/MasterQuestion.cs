using System;
using System.Collections.Generic;

namespace STEP.Domain.Entities.Master
{
    /// <summary>
    /// Central enterprise Question Bank entity (lives under isolated "examv2" schema).
    /// Used by the V2 Dynamic Question Sampler to assemble randomized candidate-specific snapshots.
    /// </summary>
    public class MasterQuestion
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Language { get; set; } = "General Aptitude";

        /// <summary>TechnicalMCQ / Coding / SQLQuery / SubjectiveTheory.</summary>
        public string SectionType { get; set; } = "TechnicalMCQ";

        /// <summary>SINGLE_CHOICE / MULTI_CHOICE / CODING / SQL / SUBJECTIVE.</summary>
        public string QuestionType { get; set; } = "SINGLE_CHOICE";

        /// <summary>Fresher / Junior / Mid-Level / Senior / Lead.</summary>
        public string ExperienceTier { get; set; } = "Fresher";

        public string QuestionText { get; set; } = string.Empty;
        public decimal Marks { get; set; } = 1.00m;

        public string? SqlSchema { get; set; }
        public string? StarterCode { get; set; }
        public string? TestCases { get; set; }

        public bool IsActive { get; set; } = true;
        public string? CreatedBy { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

        public ICollection<MasterQuestionOption> Options { get; set; } = new List<MasterQuestionOption>();
    }
}
