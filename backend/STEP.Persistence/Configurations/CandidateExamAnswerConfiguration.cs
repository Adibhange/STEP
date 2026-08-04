using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Exam;

namespace STEP.Persistence.Configurations
{
    public class CandidateExamAnswerConfiguration : IEntityTypeConfiguration<CandidateExamAnswer>
    {
        public void Configure(EntityTypeBuilder<CandidateExamAnswer> builder)
        {
            builder.ToTable("CandidateExamAnswers", "exam");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("CandidateExamAnswerId");

            builder.Property(e => e.Marks).HasColumnType("decimal(5,2)");
            builder.Property(e => e.SubmittedAnswerText).HasColumnType("nvarchar(max)");
            builder.Property(e => e.MarksObtained).HasColumnType("decimal(5,2)");
            builder.Property(e => e.EvaluationStatus).HasMaxLength(30).IsRequired().HasDefaultValue("Pending");
            builder.Property(e => e.EvaluatorRemarks).HasColumnType("nvarchar(max)");

            builder.HasIndex(e => new { e.CandidateExamSessionId, e.CandidateExamSessionQuestionId }).IsUnique();

            builder.HasOne(e => e.CandidateExamSession).WithMany(s => s.Answers).HasForeignKey(e => e.CandidateExamSessionId).OnDelete(DeleteBehavior.Cascade);
            // Restrict here (not Cascade) — CandidateExamSessionQuestion is already reachable via a
            // Cascade path directly from CandidateExamSession, so a second cascade path through
            // CandidateExamAnswer would make SQL Server reject this as a multiple-cascade-paths cycle.
            builder.HasOne(e => e.CandidateExamSessionQuestion).WithMany().HasForeignKey(e => e.CandidateExamSessionQuestionId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.EvaluatedBy).WithMany().HasForeignKey(e => e.EvaluatedById).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
