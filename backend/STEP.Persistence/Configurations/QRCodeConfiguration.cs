using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.QR;

namespace STEP.Persistence.Configurations
{
    public class QRCodeConfiguration : IEntityTypeConfiguration<QRCode>
    {
        public void Configure(EntityTypeBuilder<QRCode> builder)
        {
            builder.ToTable("QRCodes", "qr");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("QRCodeId");

            builder.Property(e => e.Code).HasMaxLength(30).IsRequired();
            builder.Property(e => e.RegistrationUrl).HasMaxLength(500).IsRequired();
            builder.Property(e => e.VenueName).HasMaxLength(150).IsRequired();
            builder.Property(e => e.VenueAddress).HasMaxLength(300);
            builder.Property(e => e.Status).HasMaxLength(20).IsRequired().HasDefaultValue("Active");
            builder.Property(e => e.RowVersion).IsRowVersion();

            builder.HasIndex(e => e.Code).IsUnique();

            builder.HasOne(e => e.Vacancy).WithMany().HasForeignKey(e => e.VacancyId).OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
