using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Exam;

namespace STEP.Persistence.Configurations
{
    public class CandidateExamAnswerOptionConfiguration : IEntityTypeConfiguration<CandidateExamAnswerOption>
    {
        public void Configure(EntityTypeBuilder<CandidateExamAnswerOption> builder)
        {
            builder.ToTable("CandidateExamAnswerOptions", "exam");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("CandidateExamAnswerOptionId");

            builder.HasIndex(e => new { e.CandidateExamAnswerId, e.CandidateExamSessionQuestionOptionId }).IsUnique();

            builder.HasOne(e => e.CandidateExamAnswer).WithMany(a => a.SelectedOptions).HasForeignKey(e => e.CandidateExamAnswerId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(e => e.CandidateExamSessionQuestionOption).WithMany().HasForeignKey(e => e.CandidateExamSessionQuestionOptionId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
