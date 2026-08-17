using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Exam;

namespace STEP.Persistence.Configurations
{
    public class CandidateExamSessionQuestionOptionConfiguration : IEntityTypeConfiguration<CandidateExamSessionQuestionOption>
    {
        public void Configure(EntityTypeBuilder<CandidateExamSessionQuestionOption> builder)
        {
            builder.ToTable("CandidateExamSessionQuestionOptions", "exam");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("CandidateExamSessionQuestionOptionId");

            builder.Property(e => e.DisplayOptionLabel).HasMaxLength(10).IsRequired();
            builder.Property(e => e.OptionText).HasColumnType("nvarchar(max)").IsRequired();

            builder.HasOne(e => e.CandidateExamSessionQuestion).WithMany(q => q.Options)
                .HasForeignKey(e => e.CandidateExamSessionQuestionId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(e => e.OriginalVacancyQuestionOption).WithMany()
                .HasForeignKey(e => e.OriginalVacancyQuestionOptionId).IsRequired(false).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.OriginalMasterQuestionOption).WithMany()
                .HasForeignKey(e => e.OriginalMasterQuestionOptionId).IsRequired(false).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
