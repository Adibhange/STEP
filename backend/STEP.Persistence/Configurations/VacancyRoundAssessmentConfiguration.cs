using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Persistence.Configurations
{
    public class VacancyRoundAssessmentConfiguration : IEntityTypeConfiguration<VacancyRoundAssessment>
    {
        public void Configure(EntityTypeBuilder<VacancyRoundAssessment> builder)
        {
            builder.ToTable("VacancyRoundAssessments", "vacancy");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("VacancyRoundAssessmentId");
            builder.HasIndex(e => e.VacancyPipelineFlowRoundId).IsUnique();

            builder.HasOne(e => e.VacancyPipelineFlowRound)
                .WithMany(r => r.RoundAssessments)
                .HasForeignKey(e => e.VacancyPipelineFlowRoundId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.VacancyQuestionPaper)
                .WithMany()
                .HasForeignKey(e => e.VacancyQuestionPaperId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
