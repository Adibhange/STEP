using System;
using System.Collections.Generic;
using STEP.Domain.Common;
using STEP.Domain.Entities.Master;

namespace STEP.Domain.Entities.Identity
{
    /// <summary>
    /// Internal staff/system user (HR, Interviewer, Director, Administrator).
    /// Not to be confused with Candidate.Candidate.
    /// </summary>
    public class User : BaseEntity
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        /// <summary>BCrypt hash of the Director's 4-digit high-privilege approval PIN. Null for non-Director roles.</summary>
        public string? PinHash { get; set; }

        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;

        public int? DepartmentId { get; set; }
        public MasterDepartment? Department { get; set; }

        public bool IsActive { get; set; } = true;
        public int AccessFailedCount { get; set; } = 0;
        public DateTime? LockoutEnd { get; set; }
        public DateTime? LastLoginAt { get; set; }

        public ICollection<UserRefreshToken> RefreshTokens { get; set; } = new List<UserRefreshToken>();
    }
}
