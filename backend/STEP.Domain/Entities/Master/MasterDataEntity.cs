using STEP.Domain.Common;

namespace STEP.Domain.Entities.Master
{
    /// <summary>
    /// Shared shape for the five Phase 1 master-data taxonomies. Each concrete type gets
    /// its own table (no EF inheritance/discriminator involved — this is a plain C# base for reuse).
    /// </summary>
    public abstract class MasterDataEntity : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
