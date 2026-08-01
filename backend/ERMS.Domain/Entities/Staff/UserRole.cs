using ERMS.Domain.Common;
using ERMS.Domain.Entities.Master;

namespace ERMS.Domain.Entities.Staff
{
    public class UserRole : BaseEntity
    {
        public int UserId { get; set; }
        public User? User { get; set; }

        public int RoleId { get; set; }
        public Role? Role { get; set; }
    }
}
