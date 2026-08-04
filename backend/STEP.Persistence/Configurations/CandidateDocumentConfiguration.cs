using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Candidate;

namespace STEP.Persistence.Configurations
{
    public class CandidateDocumentConfiguration : IEntityTypeConfiguration<CandidateDocument>
    {
        public void Configure(EntityTypeBuilder<CandidateDocument> builder)
        {
            builder.ToTable("CandidateDocuments", "candidate");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("CandidateDocumentId");

            builder.Property(e => e.DocumentType).HasMaxLength(30).IsRequired();
            builder.Property(e => e.FileName).HasMaxLength(255).IsRequired();
            builder.Property(e => e.FilePath).HasMaxLength(500).IsRequired();
            builder.Property(e => e.ContentType).HasMaxLength(100).IsRequired();
            builder.Property(e => e.StorageProvider).HasMaxLength(30).IsRequired().HasDefaultValue("Local");
            builder.Property(e => e.RowVersion).IsRowVersion();

            // Exactly one row per document type per candidate — re-uploading replaces the existing row.
            builder.HasIndex(e => new { e.CandidateId, e.DocumentType }).IsUnique();

            builder.HasOne(e => e.Candidate).WithMany(c => c.Documents).HasForeignKey(e => e.CandidateId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(e => e.UploadedBy).WithMany().HasForeignKey(e => e.UploadedById).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
