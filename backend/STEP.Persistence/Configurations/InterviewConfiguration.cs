using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Interview;

namespace STEP.Persistence.Configurations
{
    public class InterviewConfiguration : IEntityTypeConfiguration<Interview>
    {
        public void Configure(EntityTypeBuilder<Interview> builder)
        {
            builder.ToTable("Interviews", "interview");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("InterviewId");

            builder.Property(e => e.Mode).HasMaxLength(20).IsRequired();
            builder.Property(e => e.MeetingLinkOrLocation).HasMaxLength(500);
            builder.Property(e => e.Status).HasMaxLength(20).IsRequired().HasDefaultValue("Scheduled");
            builder.Property(e => e.RowVersion).IsRowVersion();

            builder.HasOne(e => e.Candidate).WithMany().HasForeignKey(e => e.CandidateId).OnDelete(DeleteBehavior.Cascade);
            // Restrict — CandidatePipelineProgress is already reachable via a Cascade path from
            // Candidate directly, so a second cascade path here would create a multi-path cycle.
            builder.HasOne(e => e.CandidatePipelineProgress).WithMany().HasForeignKey(e => e.CandidatePipelineProgressId).OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
