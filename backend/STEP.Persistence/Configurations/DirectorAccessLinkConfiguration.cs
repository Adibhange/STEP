using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Identity;

namespace STEP.Persistence.Configurations
{
    public class DirectorAccessLinkConfiguration : IEntityTypeConfiguration<DirectorAccessLink>
    {
        public void Configure(EntityTypeBuilder<DirectorAccessLink> builder)
        {
            builder.ToTable("DirectorAccessLinks", "staffv2");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).UseIdentityColumn();

            builder.Property(e => e.Token).HasMaxLength(80).IsRequired();
            builder.Property(e => e.IsRevoked).HasDefaultValue(false);

            builder.HasIndex(e => e.Token).IsUnique();
            builder.HasIndex(e => e.CandidateId);

            builder.HasOne(e => e.Candidate)
                .WithMany()
                .HasForeignKey(e => e.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
