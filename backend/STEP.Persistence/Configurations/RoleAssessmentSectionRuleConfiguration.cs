using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Master;

namespace STEP.Persistence.Configurations
{
    public class RoleAssessmentSectionRuleConfiguration : IEntityTypeConfiguration<RoleAssessmentSectionRule>
    {
        public void Configure(EntityTypeBuilder<RoleAssessmentSectionRule> builder)
        {
            builder.ToTable("RoleAssessmentSectionRules", "master");

            builder.HasKey(r => r.Id);
            builder.Property(r => r.Id).UseIdentityColumn();

            builder.Property(r => r.SectionName).HasMaxLength(150).IsRequired();
            builder.Property(r => r.SectionType).HasMaxLength(50).IsRequired();
            builder.Property(r => r.QuestionType).HasMaxLength(50).IsRequired();
            builder.Property(r => r.Difficulty).HasMaxLength(50).IsRequired();
            builder.Property(r => r.RequiredTags).HasMaxLength(500).IsRequired();
            builder.Property(r => r.MarksPerQuestion).HasColumnType("decimal(5,2)").IsRequired();
            builder.Property(r => r.ProgrammingLanguage).HasMaxLength(50);
            builder.Property(r => r.SelectionStrategy).HasMaxLength(50).IsRequired();

            builder.HasOne(r => r.RoleHiringProfile)
                .WithMany(p => p.SectionRules)
                .HasForeignKey(r => r.RoleHiringProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(r => new { r.RoleHiringProfileId, r.DisplayOrder });
        }
    }
}
