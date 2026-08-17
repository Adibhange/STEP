using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Master;

namespace STEP.Persistence.Configurations
{
    public class RoleHiringProfileConfiguration : IEntityTypeConfiguration<RoleHiringProfile>
    {
        public void Configure(EntityTypeBuilder<RoleHiringProfile> builder)
        {
            builder.ToTable("RoleHiringProfiles", "master");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("RoleHiringProfileId");

            builder.Property(e => e.ProfileName).HasMaxLength(150).IsRequired();
            builder.Property(e => e.MinExperienceYears).HasColumnType("decimal(4,2)");
            builder.Property(e => e.MaxExperienceYears).HasColumnType("decimal(4,2)");
            builder.Property(e => e.PassingPercentage).HasColumnType("decimal(5,2)").HasDefaultValue(70.00m);
            builder.Property(e => e.DefaultBaseCTC).HasColumnType("decimal(18,2)");
            builder.Property(e => e.RowVersion).IsRowVersion();

            builder.HasOne(e => e.MasterRole)
                .WithMany(r => r.HiringProfiles)
                .HasForeignKey(e => e.MasterRoleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.ExperienceLevel)
                .WithMany()
                .HasForeignKey(e => e.ExperienceLevelId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
