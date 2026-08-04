using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Persistence.Configurations
{
    public class VacancyAssessmentSectionConfiguration : IEntityTypeConfiguration<VacancyAssessmentSection>
    {
        public void Configure(EntityTypeBuilder<VacancyAssessmentSection> builder)
        {
            builder.ToTable("VacancyAssessmentSections", "vacancy");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("VacancyAssessmentSectionId");
            builder.Property(e => e.SectionTitle).HasMaxLength(150).IsRequired();
            builder.Property(e => e.MarksPerQuestion).HasColumnType("decimal(5,2)");
            builder.Property(e => e.TotalMarks).HasColumnType("decimal(6,2)");
            builder.HasIndex(e => new { e.VacancyId, e.SectionOrder }).IsUnique();

            builder.HasOne(e => e.Vacancy).WithMany(v => v.AssessmentSections).HasForeignKey(e => e.VacancyId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}
