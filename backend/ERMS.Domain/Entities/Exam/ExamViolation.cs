using System;
using ERMS.Domain.Common;

namespace ERMS.Domain.Entities.Exam
{
    public class ExamViolation : BaseEntity
    {
        public int ExamSessionId { get; set; }
        public ExamSession? ExamSession { get; set; }

        public string ViolationType { get; set; } = string.Empty; // TabSwitch, WindowBlur, CopyAttempt, PasteAttempt, DevToolsOpen, MultipleFaces, NoFace, MicNoise
        public decimal SeverityWeight { get; set; } = 1.0m;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Details { get; set; } = string.Empty;
    }
}
