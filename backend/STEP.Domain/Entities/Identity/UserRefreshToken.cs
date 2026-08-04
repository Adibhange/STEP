using System;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Identity
{
    /// <summary>
    /// Rotating refresh token record. Only the SHA-256 hash of the token is persisted, never the raw value.
    /// </summary>
    public class UserRefreshToken : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public string TokenHash { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public string? ReplacedByTokenHash { get; set; }
        public string? CreatedByIp { get; set; }

        public bool IsActive => RevokedAt == null && ExpiresAt > DateTime.UtcNow;
    }
}
