using System.Collections.Generic;
using ERMS.Domain.Common;

namespace ERMS.Domain.Entities.Question
{
    public class QuestionBank : BaseEntity
    {
        public string QuestionType { get; set; } = "MCQ"; // MCQ, SQL, Coding, Subjective, Excel, Typing, Video, Audio
        public string Category { get; set; } = string.Empty;
        public string DifficultyLevel { get; set; } = "Medium"; // Easy, Medium, Hard
        public string Title { get; set; } = string.Empty;
        public string BodyText { get; set; } = string.Empty;
        public string? CodeTemplate { get; set; }
        public string? CorrectAnswer { get; set; }
        public decimal Marks { get; set; } = 1.0m;
        public decimal NegativeMarks { get; set; } = 0.0m;
        public int Version { get; set; } = 1;

        public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
    }
}
