using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Candidate;

namespace STEP.Persistence.Configurations
{
    public class CandidatePipelineProgressConfiguration : IEntityTypeConfiguration<CandidatePipelineProgress>
    {
        public void Configure(EntityTypeBuilder<CandidatePipelineProgress> builder)
        {
            builder.ToTable("CandidatePipelineProgress", "candidate");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("CandidatePipelineProgressId");

            builder.Property(e => e.RoundTitle).HasMaxLength(100).IsRequired();
            builder.Property(e => e.RoundType).HasMaxLength(30).IsRequired();
            builder.Property(e => e.Status).HasMaxLength(30).IsRequired().HasDefaultValue("Assigned");
            builder.Property(e => e.ScoreObtained).HasColumnType("decimal(6,2)");
            builder.Property(e => e.SkipReason).HasColumnType("nvarchar(max)");
            builder.Property(e => e.Remarks).HasColumnType("nvarchar(max)");
            builder.Property(e => e.RowVersion).IsRowVersion();

            builder.HasIndex(e => new { e.CandidateId, e.RoundNumber }).IsUnique();

            builder.HasOne(e => e.Candidate)
                .WithMany(c => c.PipelineProgressHistory)
                .HasForeignKey(e => e.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.VacancyPipelineFlowRound)
                .WithMany()
                .HasForeignKey(e => e.VacancyPipelineFlowRoundId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.Evaluator).WithMany().HasForeignKey(e => e.EvaluatorId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.SkippedBy).WithMany().HasForeignKey(e => e.SkippedById).OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
