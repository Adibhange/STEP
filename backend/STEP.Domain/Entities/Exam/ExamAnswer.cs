using System;
using STEP.Domain.Common;
using STEP.Domain.Entities.Question;
using STEP.Domain.Entities.Staff;

namespace STEP.Domain.Entities.Exam
{
    public class ExamAnswer : BaseEntity
    {
        public int ExamSessionId { get; set; }
        public ExamSession? ExamSession { get; set; }

        public int QuestionId { get; set; }
        public QuestionBank? Question { get; set; }

        public string? SubmittedAnswerText { get; set; }
        public string? SelectedOptionIds { get; set; } // Comma separated for multi-choice or single choice
        public decimal? ObtainedMarks { get; set; }
        public bool IsEvaluated { get; set; } = false;
        
        public int? EvaluatedByUserId { get; set; }
        public User? EvaluatedByUser { get; set; }
        
        public DateTime? EvaluatedDate { get; set; }
    }
}
