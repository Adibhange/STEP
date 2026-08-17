using STEP.Domain.Common;

namespace STEP.Domain.Entities.Master
{
    /// <summary>
    /// Answer option choice for an objective MasterQuestion in the central Question Bank.
    /// </summary>
    public class MasterQuestionOption : BaseEntity
    {
        public int MasterQuestionId { get; set; }
        public MasterQuestion MasterQuestion { get; set; } = null!;

        public string OptionLabel { get; set; } = string.Empty; // A, B, C, D
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int DisplayOrder { get; set; }
    }
}
