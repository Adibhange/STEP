using System;
using ERMS.Domain.Common;

namespace ERMS.Domain.Entities.Staff
{
    public class UserSession : BaseEntity
    {
        public int UserId { get; set; }
        public User? User { get; set; }

        public string RefreshToken { get; set; } = string.Empty;
        public DateTime RefreshTokenExpiry { get; set; }
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public string DeviceFingerprint { get; set; } = string.Empty;
        public bool IsRevoked { get; set; } = false;
    }
}
