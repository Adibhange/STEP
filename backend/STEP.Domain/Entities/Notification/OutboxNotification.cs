using System;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Notification
{
    public class OutboxNotification : BaseEntity
    {
        public string Channel { get; set; } = "Email"; // Email, SMS, WhatsApp, InApp
        public string Recipient { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Sent, Failed
        public int RetryCount { get; set; } = 0;
        public DateTime ScheduledTime { get; set; } = DateTime.UtcNow;
    }
}
