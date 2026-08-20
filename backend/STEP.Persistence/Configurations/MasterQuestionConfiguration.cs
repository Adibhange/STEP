using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Master;

namespace STEP.Persistence.Configurations
{
    public class MasterQuestionConfiguration : IEntityTypeConfiguration<MasterQuestion>
    {
        public void Configure(EntityTypeBuilder<MasterQuestion> builder)
        {
            builder.ToTable("MasterQuestions", "examv2");

            builder.HasKey(q => q.Id);
            builder.Property(q => q.Id).UseIdentityColumn();

            builder.Property(q => q.Code).HasMaxLength(30).IsRequired();
            builder.Property(q => q.Language).HasMaxLength(50).IsRequired();
            builder.Property(q => q.SectionType).HasMaxLength(30).IsRequired();
            builder.Property(q => q.QuestionType).HasMaxLength(30).IsRequired();
            builder.Property(q => q.ExperienceTier).HasMaxLength(30).IsRequired();
            builder.Property(q => q.QuestionText).IsRequired();
            builder.Property(q => q.Marks).HasColumnType("decimal(5,2)").HasDefaultValue(1.00m).IsRequired();
            builder.Property(q => q.CreatedBy).HasMaxLength(60);
            builder.Property(q => q.UpdatedBy).HasMaxLength(60);

            builder.HasIndex(q => q.Code).IsUnique();
            builder.HasIndex(q => new { q.Language, q.SectionType, q.QuestionType, q.ExperienceTier, q.IsActive });

            builder.HasMany(q => q.Options)
                .WithOne(o => o.MasterQuestion)
                .HasForeignKey(o => o.MasterQuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class MasterQuestionOptionConfiguration : IEntityTypeConfiguration<MasterQuestionOption>
    {
        public void Configure(EntityTypeBuilder<MasterQuestionOption> builder)
        {
            builder.ToTable("MasterQuestionOptions", "examv2");

            builder.HasKey(o => o.Id);
            builder.Property(o => o.Id).UseIdentityColumn();

            builder.Property(o => o.OptionLabel).HasMaxLength(10).IsRequired();
            builder.Property(o => o.OptionText).IsRequired();
            builder.Property(o => o.IsCorrect).HasDefaultValue(false);
            builder.Property(o => o.DisplayOrder).HasDefaultValue(1);

            builder.HasIndex(o => o.MasterQuestionId);
        }
    }
}
