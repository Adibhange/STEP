using ERMS.Domain.Common;

namespace ERMS.Domain.Entities.Master
{
    public class Location : BaseEntity
    {
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Country { get; set; } = "India";
        public bool IsActive { get; set; } = true;
    }
}
