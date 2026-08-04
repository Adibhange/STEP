using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Persistence.Configurations
{
    public class VacancyPipelineFlowConfiguration : IEntityTypeConfiguration<VacancyPipelineFlow>
    {
        public void Configure(EntityTypeBuilder<VacancyPipelineFlow> builder)
        {
            builder.ToTable("VacancyPipelineFlows", "vacancy");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("VacancyPipelineFlowId");
            builder.Property(e => e.VersionName).HasMaxLength(150).IsRequired();
            builder.Property(e => e.Description).HasMaxLength(500);

            builder.HasOne(e => e.Vacancy).WithMany(v => v.PipelineFlows).HasForeignKey(e => e.VacancyId).OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class VacancyPipelineFlowRoundConfiguration : IEntityTypeConfiguration<VacancyPipelineFlowRound>
    {
        public void Configure(EntityTypeBuilder<VacancyPipelineFlowRound> builder)
        {
            builder.ToTable("VacancyPipelineFlowRounds", "vacancy");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("VacancyPipelineFlowRoundId");
            builder.Property(e => e.Name).HasMaxLength(150).IsRequired();
            builder.Property(e => e.RoundType).HasMaxLength(30).IsRequired();
            builder.Property(e => e.CutoffPercent).HasColumnType("decimal(5,2)");
            builder.HasIndex(e => new { e.VacancyPipelineFlowId, e.RoundOrder }).IsUnique();

            builder.HasOne(e => e.VacancyPipelineFlow).WithMany(f => f.Rounds).HasForeignKey(e => e.VacancyPipelineFlowId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}
