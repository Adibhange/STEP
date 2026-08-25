using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Candidate;

namespace STEP.Persistence.Configurations
{
    public class CandidateConfiguration : IEntityTypeConfiguration<Candidate>
    {
        public void Configure(EntityTypeBuilder<Candidate> builder)
        {
            builder.ToTable("Candidates", "candidate");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("CandidateId");

            builder.Property(e => e.CandidateCode).HasMaxLength(30).IsRequired();
            builder.Property(e => e.FirstName).HasMaxLength(50).IsRequired();
            builder.Property(e => e.LastName).HasMaxLength(50).IsRequired();
            builder.Property(e => e.Email).HasMaxLength(150).IsRequired();
            builder.Property(e => e.Phone).HasMaxLength(20).IsRequired();
            builder.Property(e => e.CurrentStage).HasMaxLength(100).IsRequired();
            builder.Property(e => e.Status).HasMaxLength(30).IsRequired().HasDefaultValue("Applied");
            builder.Property(e => e.RegistrationChannel).HasMaxLength(30).IsRequired();
            builder.Property(e => e.ReferralEmployeeName).HasMaxLength(100);
            builder.Property(e => e.TotalExperienceYears).HasColumnType("decimal(4,1)");
            builder.Property(e => e.CurrentCTC).HasColumnType("decimal(12,2)");
            builder.Property(e => e.ExpectedCTC).HasColumnType("decimal(12,2)");
            builder.Property(e => e.CurrentLocation).HasMaxLength(100);
            builder.Property(e => e.HighestQualification).HasMaxLength(100);
            builder.Property(e => e.ExamPasscodeHash).HasMaxLength(256);
            builder.Property(e => e.RowVersion).IsRowVersion();

            builder.HasIndex(e => e.CandidateCode).IsUnique();
            builder.HasIndex(e => e.Email);

            builder.HasOne(e => e.Vacancy).WithMany().HasForeignKey(e => e.VacancyId).IsRequired(false).OnDelete(DeleteBehavior.Restrict);

            // Candidate -> CandidatePipelineProgress (owning direction) is Cascade; the reverse
            // "current pointer" below must be Restrict, or SQL Server rejects the cycle as
            // multiple cascade paths between the same two tables.
            builder.HasOne(e => e.CurrentPipelineProgress)
                .WithMany()
                .HasForeignKey(e => e.CurrentPipelineProgressId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.QRCode).WithMany().HasForeignKey(e => e.QRCodeId).OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
