using STEP.Domain.Common;

namespace STEP.Domain.Entities.Identity
{
    /// <summary>
    /// Join entity granting a Permission to a Role.
    /// </summary>
    public class RolePermission : BaseEntity
    {
        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;

        public int PermissionId { get; set; }
        public Permission Permission { get; set; } = null!;
    }
}
