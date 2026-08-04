using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Persistence.Configurations
{
    public class VacancyQuestionConfiguration : IEntityTypeConfiguration<VacancyQuestion>
    {
        public void Configure(EntityTypeBuilder<VacancyQuestion> builder)
        {
            builder.ToTable("VacancyQuestions", "question");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("VacancyQuestionId");
            builder.Property(e => e.QuestionType).HasMaxLength(30).IsRequired();
            builder.Property(e => e.QuestionText).HasColumnType("nvarchar(max)").IsRequired();
            builder.Property(e => e.Marks).HasColumnType("decimal(5,2)");
            builder.Property(e => e.ProgrammingLanguage).HasMaxLength(50);
            builder.Property(e => e.SqlSchema).HasColumnType("nvarchar(max)");

            builder.HasOne(e => e.VacancyQuestionPaper).WithMany(p => p.Questions).HasForeignKey(e => e.VacancyQuestionPaperId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(e => e.VacancyAssessmentSection).WithMany().HasForeignKey(e => e.VacancyAssessmentSectionId).OnDelete(DeleteBehavior.Restrict);
        }
    }

    public class VacancyQuestionOptionConfiguration : IEntityTypeConfiguration<VacancyQuestionOption>
    {
        public void Configure(EntityTypeBuilder<VacancyQuestionOption> builder)
        {
            builder.ToTable("VacancyQuestionOptions", "question");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("VacancyQuestionOptionId");
            builder.Property(e => e.OptionLabel).HasMaxLength(10).IsRequired();
            builder.Property(e => e.OptionText).HasColumnType("nvarchar(max)").IsRequired();

            builder.HasOne(e => e.VacancyQuestion).WithMany(q => q.Options).HasForeignKey(e => e.VacancyQuestionId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}
