using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Exam;

namespace STEP.Persistence.Configurations
{
    public class CandidateExamSessionQuestionConfiguration : IEntityTypeConfiguration<CandidateExamSessionQuestion>
    {
        public void Configure(EntityTypeBuilder<CandidateExamSessionQuestion> builder)
        {
            builder.ToTable("CandidateExamSessionQuestions", "exam");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("CandidateExamSessionQuestionId");

            builder.Property(e => e.QuestionType).HasMaxLength(30).IsRequired();
            builder.Property(e => e.QuestionText).HasColumnType("nvarchar(max)").IsRequired();
            builder.Property(e => e.Marks).HasColumnType("decimal(5,2)");
            builder.Property(e => e.ProgrammingLanguage).HasMaxLength(50);
            builder.Property(e => e.SqlSchema).HasColumnType("nvarchar(max)");
            builder.Property(e => e.QuestionSnapshotJson).HasColumnType("nvarchar(max)").IsRequired();

            builder.HasIndex(e => new { e.CandidateExamSessionId, e.DisplayOrder }).IsUnique();

            builder.HasOne(e => e.CandidateExamSession).WithMany(s => s.Questions).HasForeignKey(e => e.CandidateExamSessionId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(e => e.OriginalVacancyQuestion).WithMany().HasForeignKey(e => e.OriginalVacancyQuestionId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
