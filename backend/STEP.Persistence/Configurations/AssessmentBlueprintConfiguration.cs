using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Exam;

namespace STEP.Persistence.Configurations
{
    public class AssessmentBlueprintConfiguration : IEntityTypeConfiguration<AssessmentBlueprint>
    {
        public void Configure(EntityTypeBuilder<AssessmentBlueprint> builder)
        {
            builder.ToTable("AssessmentBlueprints", "examv2");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).UseIdentityColumn();

            builder.Property(e => e.Code).HasMaxLength(30).IsRequired();
            builder.Property(e => e.Name).HasMaxLength(80).IsRequired();
            builder.Property(e => e.DefaultPassingPercentage).HasColumnType("decimal(5,2)").HasDefaultValue(70.00m);
            builder.Property(e => e.TotalDurationMinutes).HasDefaultValue(0);
            builder.Property(e => e.TotalQuestions).HasDefaultValue(0);
            builder.Property(e => e.TotalMarks).HasColumnType("decimal(5,2)").HasDefaultValue(0.00m);
            builder.Property(e => e.EnableQuestionShuffling).HasDefaultValue(true);
            builder.Property(e => e.EnableOptionShuffling).HasDefaultValue(true);
            builder.Property(e => e.IsDefault).HasDefaultValue(false);
            builder.Property(e => e.IsActive).HasDefaultValue(true);
            builder.Property(e => e.CreatedBy).HasMaxLength(60);
            builder.Property(e => e.UpdatedBy).HasMaxLength(60);

            builder.HasIndex(e => e.Code).IsUnique();

            builder.HasMany(e => e.SectionRules)
                .WithOne(r => r.Blueprint)
                .HasForeignKey(r => r.BlueprintId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class AssessmentBlueprintSectionRuleConfiguration : IEntityTypeConfiguration<AssessmentBlueprintSectionRule>
    {
        public void Configure(EntityTypeBuilder<AssessmentBlueprintSectionRule> builder)
        {
            builder.ToTable("AssessmentBlueprintSectionRules", "examv2");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).UseIdentityColumn();

            builder.Property(e => e.SectionName).HasMaxLength(60).IsRequired();
            builder.Property(e => e.SectionType).HasMaxLength(30).IsRequired();
            builder.Property(e => e.QuestionType).HasMaxLength(30).IsRequired();
            builder.Property(e => e.ExperienceTier).HasMaxLength(30).HasDefaultValue("{InheritFromCandidateTier}").IsRequired();
            builder.Property(e => e.RequiredTags).HasMaxLength(100).HasDefaultValue("{InheritFromRole}").IsRequired();
            builder.Property(e => e.MarksPerQuestion).HasColumnType("decimal(5,2)").HasDefaultValue(1.00m);
            builder.Property(e => e.SelectionStrategy).HasMaxLength(30).HasDefaultValue("RandomShuffled").IsRequired();
            builder.Property(e => e.DisplayOrder).HasDefaultValue(1);
            builder.Property(e => e.IsActive).HasDefaultValue(true);

            builder.HasIndex(e => e.BlueprintId);
        }
    }
}
