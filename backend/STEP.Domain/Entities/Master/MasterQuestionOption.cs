using System;

namespace STEP.Domain.Entities.Master
{
    /// <summary>
    /// Master Question MCQ Option (lives under isolated "examv2" schema).
    /// </summary>
    public class MasterQuestionOption
    {
        public int Id { get; set; }
        public int MasterQuestionId { get; set; }
        public MasterQuestion MasterQuestion { get; set; } = null!;

        public string OptionLabel { get; set; } = "A";
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int DisplayOrder { get; set; } = 1;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
