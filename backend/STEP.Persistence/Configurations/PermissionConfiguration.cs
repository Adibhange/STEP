using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Identity;

namespace STEP.Persistence.Configurations
{
    public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
    {
        public void Configure(EntityTypeBuilder<Permission> builder)
        {
            builder.ToTable("Permissions", "master");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("PermissionId");
            builder.Property(e => e.Module).HasMaxLength(50).IsRequired();
            builder.Property(e => e.Action).HasMaxLength(50).IsRequired();
            builder.Property(e => e.Code).HasMaxLength(100).IsRequired();
            builder.Property(e => e.Description).HasMaxLength(200);
            builder.Property(e => e.RowVersion).IsRowVersion();
            builder.HasIndex(e => e.Code).IsUnique();
            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
