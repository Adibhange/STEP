using STEP.Domain.Common;

namespace STEP.Domain.Entities.Master
{
    public class Role : BaseEntity
    {
        public string RoleName { get; set; } = string.Empty; // e.g., HR, Director, Interviewer, Administrator
        public string Description { get; set; } = string.Empty;
        public bool IsSystemRole { get; set; } = true;
    }
}
