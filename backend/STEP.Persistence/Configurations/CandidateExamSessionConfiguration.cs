using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Exam;

namespace STEP.Persistence.Configurations
{
    public class CandidateExamSessionConfiguration : IEntityTypeConfiguration<CandidateExamSession>
    {
        public void Configure(EntityTypeBuilder<CandidateExamSession> builder)
        {
            builder.ToTable("CandidateExamSessions", "exam");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("CandidateExamSessionId");

            builder.Property(e => e.SessionToken).HasMaxLength(100).IsRequired();
            builder.Property(e => e.SnapshotCandidateName).HasMaxLength(100).IsRequired();
            builder.Property(e => e.SnapshotCandidateCode).HasMaxLength(30).IsRequired();
            builder.Property(e => e.SnapshotVacancyTitle).HasMaxLength(150).IsRequired();
            builder.Property(e => e.SnapshotVacancyCode).HasMaxLength(30).IsRequired();
            builder.Property(e => e.SnapshotPaperCode).HasMaxLength(30).IsRequired();
            builder.Property(e => e.SnapshotPaperTitle).HasMaxLength(150).IsRequired();
            builder.Property(e => e.AssessmentSource).HasMaxLength(50).IsRequired().HasDefaultValue("DynamicQuestionBank");
            builder.Property(e => e.FrozenAssessmentMode).HasMaxLength(20).IsRequired();
            builder.Property(e => e.TestSource).HasMaxLength(20).IsRequired();
            builder.Property(e => e.FrozenIPAddress).HasMaxLength(50);
            builder.Property(e => e.FrozenBrowser).HasMaxLength(200);
            builder.Property(e => e.FrozenOS).HasMaxLength(50);
            builder.Property(e => e.FrozenDeviceType).HasMaxLength(30);
            builder.Property(e => e.FrozenPassingPercentage).HasColumnType("decimal(5,2)");
            builder.Property(e => e.SessionStatus).HasMaxLength(30).IsRequired().HasDefaultValue("Created");
            builder.Property(e => e.EvaluationStatus).HasMaxLength(30).IsRequired().HasDefaultValue("Pending");
            builder.Property(e => e.TotalScore).HasColumnType("decimal(6,2)");
            builder.Property(e => e.TotalMarks).HasColumnType("decimal(6,2)");
            builder.Property(e => e.Percentage).HasColumnType("decimal(5,2)");
            builder.Property(e => e.ResultStatus).HasMaxLength(20).IsRequired().HasDefaultValue("Pending");
            builder.Property(e => e.AssessmentIntegrityScore).HasColumnType("decimal(5,2)").HasDefaultValue(100.00m);
            builder.Property(e => e.RowVersion).IsRowVersion();

            builder.HasIndex(e => e.SessionToken).IsUnique();

            builder.HasOne(e => e.Candidate).WithMany().HasForeignKey(e => e.CandidateId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(e => e.Vacancy).WithMany().HasForeignKey(e => e.VacancyId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.RoleHiringProfile).WithMany().HasForeignKey(e => e.RoleHiringProfileId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.VacancyQuestionPaper).WithMany().HasForeignKey(e => e.VacancyQuestionPaperId).IsRequired(false).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.CandidatePipelineProgress).WithMany().HasForeignKey(e => e.CandidatePipelineProgressId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.Evaluator).WithMany().HasForeignKey(e => e.EvaluatorId).OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
