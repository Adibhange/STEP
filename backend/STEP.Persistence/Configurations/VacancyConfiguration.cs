using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Persistence.Configurations
{
    public class VacancyConfiguration : IEntityTypeConfiguration<Vacancy>
    {
        public void Configure(EntityTypeBuilder<Vacancy> builder)
        {
            builder.ToTable("Vacancies", "vacancy");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("VacancyId");
            builder.Property(e => e.VacancyCode).HasMaxLength(30).IsRequired();
            builder.Property(e => e.Title).HasMaxLength(150).IsRequired();
            builder.Property(e => e.DriveType).HasMaxLength(30).IsRequired();
            builder.Property(e => e.Status).HasMaxLength(30).IsRequired().HasDefaultValue("Draft");
            builder.Property(e => e.WorkMode).HasMaxLength(30).IsRequired();
            builder.Property(e => e.MinExperienceYears).HasColumnType("decimal(4,1)");
            builder.Property(e => e.PassingPercentageOverride).HasColumnType("decimal(5,2)");
            builder.Property(e => e.RowVersion).IsRowVersion();
            builder.HasIndex(e => e.VacancyCode).IsUnique();

            builder.HasOne(e => e.MasterRole).WithMany().HasForeignKey(e => e.MasterRoleId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.Department).WithMany().HasForeignKey(e => e.DepartmentId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.HiringLocation).WithMany().HasForeignKey(e => e.HiringLocationId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.EmploymentType).WithMany().HasForeignKey(e => e.EmploymentTypeId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.AssignedRecruiter).WithMany().HasForeignKey(e => e.AssignedRecruiterId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.AssessmentBlueprint).WithMany().HasForeignKey(e => e.AssessmentBlueprintId).IsRequired(false).OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
