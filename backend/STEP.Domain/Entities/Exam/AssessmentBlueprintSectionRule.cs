using System;

namespace STEP.Domain.Entities.Exam
{
    /// <summary>
    /// Relational section rule belonging to an Assessment Blueprint (lives under "examv2" schema).
    /// Dictates composition: SectionType, QuestionType, QuestionCount, Marks, TimeLimit.
    /// </summary>
    public class AssessmentBlueprintSectionRule
    {
        public int Id { get; set; }
        public int BlueprintId { get; set; }
        public AssessmentBlueprint Blueprint { get; set; } = null!;

        public string SectionName { get; set; } = string.Empty;
        public string SectionType { get; set; } = "TechnicalMCQ";
        public string QuestionType { get; set; } = "SINGLE_CHOICE";
        public string ExperienceTier { get; set; } = "{InheritFromCandidateTier}";
        public string RequiredTags { get; set; } = "{InheritFromRole}";
        public int QuestionCount { get; set; } = 5;
        public decimal MarksPerQuestion { get; set; } = 1.00m;
        public int? TimeLimitMinutes { get; set; }
        public string SelectionStrategy { get; set; } = "RandomShuffled";
        public int DisplayOrder { get; set; } = 1;
        public bool IsActive { get; set; } = true;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
