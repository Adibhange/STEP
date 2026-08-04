using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Persistence.Configurations
{
    public class VacancyTestLocationConfiguration : IEntityTypeConfiguration<VacancyTestLocation>
    {
        public void Configure(EntityTypeBuilder<VacancyTestLocation> builder)
        {
            builder.ToTable("VacancyTestLocations", "vacancy");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("VacancyTestLocationId");
            builder.HasIndex(e => new { e.VacancyId, e.MasterTestLocationId }).IsUnique();

            builder.HasOne(e => e.Vacancy).WithMany(v => v.TestLocations).HasForeignKey(e => e.VacancyId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(e => e.MasterTestLocation).WithMany().HasForeignKey(e => e.MasterTestLocationId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
