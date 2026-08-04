using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.QR;

namespace STEP.Persistence.Configurations
{
    public class QRScanAnalyticConfiguration : IEntityTypeConfiguration<QRScanAnalytic>
    {
        public void Configure(EntityTypeBuilder<QRScanAnalytic> builder)
        {
            builder.ToTable("QRScanAnalytics", "qr");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("QRScanAnalyticId");

            builder.Property(e => e.IpAddress).HasMaxLength(50);
            builder.Property(e => e.UserAgent).HasMaxLength(500);
            builder.Property(e => e.RowVersion).IsRowVersion();

            builder.HasIndex(e => e.QRCodeId);

            builder.HasOne(e => e.QRCode).WithMany(q => q.ScanAnalytics).HasForeignKey(e => e.QRCodeId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(e => e.Candidate).WithMany().HasForeignKey(e => e.CandidateId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
