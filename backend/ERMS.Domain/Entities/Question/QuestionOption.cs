using ERMS.Domain.Common;

namespace ERMS.Domain.Entities.Question
{
    public class QuestionOption : BaseEntity
    {
        public int QuestionId { get; set; }
        public QuestionBank? Question { get; set; }

        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; } = false;
        public int DisplayOrder { get; set; } = 1;
    }
}
