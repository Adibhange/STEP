using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Interview;

namespace STEP.Persistence.Configurations
{
    public class InterviewRoundDetailConfiguration : IEntityTypeConfiguration<InterviewRoundDetail>
    {
        public void Configure(EntityTypeBuilder<InterviewRoundDetail> builder)
        {
            builder.ToTable("InterviewRoundDetails", "interview");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("InterviewRoundDetailId");

            builder.Property(e => e.Strengths).HasColumnType("nvarchar(max)");
            builder.Property(e => e.Weaknesses).HasColumnType("nvarchar(max)");
            builder.Property(e => e.Recommendation).HasMaxLength(20).IsRequired().HasDefaultValue("OnHold");
            builder.Property(e => e.Comments).HasColumnType("nvarchar(max)");
            builder.Property(e => e.RowVersion).IsRowVersion();

            builder.HasIndex(e => new { e.InterviewId, e.PanelistUserId }).IsUnique();

            builder.HasOne(e => e.Interview).WithMany(i => i.RoundDetails).HasForeignKey(e => e.InterviewId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(e => e.Panelist).WithMany().HasForeignKey(e => e.PanelistUserId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
