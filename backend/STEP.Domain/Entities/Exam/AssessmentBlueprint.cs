using System;
using System.Collections.Generic;

namespace STEP.Domain.Entities.Exam
{
    /// <summary>
    /// Universal Assessment Blueprint template entity (lives under isolated "examv2" schema).
    /// Selected at vacancy creation time.
    /// </summary>
    public class AssessmentBlueprint
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal DefaultPassingPercentage { get; set; } = 70.00m;
        public int TotalDurationMinutes { get; set; }
        public int TotalQuestions { get; set; }
        public decimal TotalMarks { get; set; }
        public bool EnableQuestionShuffling { get; set; } = true;
        public bool EnableOptionShuffling { get; set; } = true;
        public bool IsDefault { get; set; }
        public bool IsActive { get; set; } = true;

        public string? CreatedBy { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

        public ICollection<AssessmentBlueprintSectionRule> SectionRules { get; set; } = new List<AssessmentBlueprintSectionRule>();
    }
}
