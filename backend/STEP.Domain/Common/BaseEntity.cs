using System;

namespace STEP.Domain.Common
{
    /// <summary>
    /// Base audit contract shared by every STEP ATS entity.
    /// INT IDENTITY(1,1) primary keys throughout (per explicit direction — supersedes the
    /// original blueprint's GUID-key guidance).
    /// </summary>
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    }
}
