using System;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Notification
{
    /// <summary>
    /// Transactional outbox: written in the same SaveChangesAsync call as the business change it
    /// describes (see PublishAssessmentResultCommand step 8), so the event can never be "lost" by
    /// a crash between the DB write and a message-broker publish. A background dispatcher (see
    /// STEP.Infrastructure) picks up Pending rows and marks them Sent — currently simulated
    /// (logs only) since no real email/SMTP provider is configured yet.
    /// </summary>
    public class OutboxMessage : BaseEntity
    {
        public string EventType { get; set; } = string.Empty;
        public string Payload { get; set; } = string.Empty;

        /// <summary>Pending / Processing / Sent / Failed.</summary>
        public string Status { get; set; } = "Pending";
        public int Attempts { get; set; } = 0;
        public DateTime? ProcessedAt { get; set; }
        public string? Error { get; set; }
    }
}
