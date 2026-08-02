using System;

namespace STEP.Domain.Entities.Audit
{
    public class AuditLog
    {
        public int AuditId { get; set; }
        public int? UserId { get; set; }
        public int? CandidateId { get; set; }
        public string Action { get; set; } = string.Empty; // Login, Logout, Create, Update, Delete, Export, Evaluation, Interview, Exam
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string IpAddress { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
