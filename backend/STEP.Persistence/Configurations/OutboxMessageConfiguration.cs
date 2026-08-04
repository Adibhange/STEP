using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Notification;

namespace STEP.Persistence.Configurations
{
    public class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
    {
        public void Configure(EntityTypeBuilder<OutboxMessage> builder)
        {
            builder.ToTable("OutboxMessages", "notification");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("OutboxMessageId");

            builder.Property(e => e.EventType).HasMaxLength(100).IsRequired();
            builder.Property(e => e.Payload).HasColumnType("nvarchar(max)").IsRequired();
            builder.Property(e => e.Status).HasMaxLength(20).IsRequired().HasDefaultValue("Pending");
            builder.Property(e => e.Error).HasColumnType("nvarchar(max)");
            builder.Property(e => e.RowVersion).IsRowVersion();

            builder.HasIndex(e => e.Status);
        }
    }
}
