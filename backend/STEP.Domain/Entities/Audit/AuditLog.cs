using System;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Audit
{
    /// <summary>
    /// Immutable audit trail row. Every write-side command handler dispatches one of these.
    /// CorrelationId ties a single logical operation (which may touch multiple tables) together.
    /// </summary>
    public class AuditLog : BaseEntity
    {
        public Guid CorrelationId { get; set; }
        public int? UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string? Changes { get; set; }
        public string? IpAddress { get; set; }
    }
}
