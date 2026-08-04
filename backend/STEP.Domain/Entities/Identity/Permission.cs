using System.Collections.Generic;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Identity
{
    /// <summary>
    /// Granular RBAC permission, e.g. Module="Vacancy", Action="Create", Code="Vacancy.Create".
    /// </summary>
    public class Permission : BaseEntity
    {
        public string Module { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }

        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
