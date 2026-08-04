using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Persistence.Configurations
{
    public class VacancyQuestionPaperConfiguration : IEntityTypeConfiguration<VacancyQuestionPaper>
    {
        public void Configure(EntityTypeBuilder<VacancyQuestionPaper> builder)
        {
            builder.ToTable("VacancyQuestionPapers", "question");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("VacancyQuestionPaperId");
            builder.Property(e => e.PaperCode).HasMaxLength(30).IsRequired();
            builder.Property(e => e.Title).HasMaxLength(150).IsRequired();
            builder.Property(e => e.TotalMarks).HasColumnType("decimal(6,2)");
            builder.Property(e => e.PassingPercentage).HasColumnType("decimal(5,2)");
            builder.Property(e => e.Status).HasMaxLength(20).IsRequired().HasDefaultValue("Draft");
            builder.HasIndex(e => e.PaperCode).IsUnique();

            builder.HasOne(e => e.Vacancy).WithMany(v => v.QuestionPapers).HasForeignKey(e => e.VacancyId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(e => e.PublishedBy).WithMany().HasForeignKey(e => e.PublishedById).OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
