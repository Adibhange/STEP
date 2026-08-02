using STEP.Domain.Common;
using STEP.Domain.Entities.Master;

namespace STEP.Domain.Entities.Staff
{
    public class UserRole : BaseEntity
    {
        public int UserId { get; set; }
        public User? User { get; set; }

        public int RoleId { get; set; }
        public Role? Role { get; set; }
    }
}
