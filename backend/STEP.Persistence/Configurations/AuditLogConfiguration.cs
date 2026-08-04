using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Audit;

namespace STEP.Persistence.Configurations
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("AuditLogs", "audit");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("AuditLogId");
            builder.Property(e => e.Action).HasMaxLength(100).IsRequired();
            builder.Property(e => e.EntityName).HasMaxLength(100).IsRequired();
            builder.Property(e => e.EntityId).HasMaxLength(64).IsRequired();
            builder.Property(e => e.IpAddress).HasMaxLength(45);
            builder.Property(e => e.RowVersion).IsRowVersion();
            builder.HasIndex(e => e.CorrelationId);
        }
    }
}
