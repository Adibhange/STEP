using System.Collections.Generic;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Identity
{
    /// <summary>
    /// RBAC access role (e.g. Administrator, Director, HR, Interviewer).
    /// Distinct from Master.MasterRole, which models candidate/vacancy job-title taxonomy.
    /// </summary>
    public class Role : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsSystemRole { get; set; } = false;

        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
