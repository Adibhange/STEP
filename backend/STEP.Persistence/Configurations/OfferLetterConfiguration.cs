using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Interview;

namespace STEP.Persistence.Configurations
{
    public class OfferLetterConfiguration : IEntityTypeConfiguration<OfferLetter>
    {
        public void Configure(EntityTypeBuilder<OfferLetter> builder)
        {
            builder.ToTable("OfferLetters", "interview");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("OfferLetterId");

            builder.Property(e => e.OfferedCTC).HasColumnType("decimal(12,2)");
            builder.Property(e => e.Status).HasMaxLength(20).IsRequired().HasDefaultValue("Draft");
            builder.Property(e => e.GeneratedPdfPath).HasMaxLength(500);
            builder.Property(e => e.RowVersion).IsRowVersion();

            builder.HasOne(e => e.Candidate).WithMany().HasForeignKey(e => e.CandidateId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.Vacancy).WithMany().HasForeignKey(e => e.VacancyId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.PreparedBy).WithMany().HasForeignKey(e => e.PreparedById).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(e => e.ApprovedBy).WithMany().HasForeignKey(e => e.ApprovedById).OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
