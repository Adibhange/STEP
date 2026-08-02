using System;
using System.Collections.Generic;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Staff
{
    public class User : BaseEntity
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string PasswordSalt { get; set; } = string.Empty;
        public string? PinHash { get; set; } // Hashed Director 6-digit PIN for high-level approvals
        public bool IsActive { get; set; } = true;
        public bool Is2FAEnabled { get; set; } = false;
        public string? TwoFactorSecret { get; set; }
        public DateTime? LockoutEnd { get; set; }
        public int AccessFailedCount { get; set; } = 0;

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}
