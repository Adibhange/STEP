using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Master;

namespace STEP.Persistence.Configurations
{
    public class MasterQuestionConfiguration : IEntityTypeConfiguration<MasterQuestion>
    {
        public void Configure(EntityTypeBuilder<MasterQuestion> builder)
        {
            builder.ToTable("MasterQuestions", "master");

            builder.HasKey(q => q.Id);
            builder.Property(q => q.Id).UseIdentityColumn();

            builder.Property(q => q.SectionType).HasMaxLength(50).IsRequired();
            builder.Property(q => q.QuestionType).HasMaxLength(50).IsRequired();
            builder.Property(q => q.Difficulty).HasMaxLength(50).IsRequired();
            builder.Property(q => q.ExperienceLevel).HasMaxLength(50).IsRequired();
            builder.Property(q => q.Tags).HasMaxLength(500).IsRequired();
            builder.Property(q => q.QuestionText).IsRequired();
            builder.Property(q => q.Marks).HasColumnType("decimal(5,2)").IsRequired();
            builder.Property(q => q.ProgrammingLanguage).HasMaxLength(50);
            builder.Property(q => q.SqlSchema).HasMaxLength(4000);

            builder.HasOne(q => q.MasterRole)
                .WithMany()
                .HasForeignKey(q => q.MasterRoleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(q => q.Options)
                .WithOne(o => o.MasterQuestion)
                .HasForeignKey(o => o.MasterQuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(q => new { q.MasterRoleId, q.SectionType, q.Difficulty, q.IsActive });
        }
    }

    public class MasterQuestionOptionConfiguration : IEntityTypeConfiguration<MasterQuestionOption>
    {
        public void Configure(EntityTypeBuilder<MasterQuestionOption> builder)
        {
            builder.ToTable("MasterQuestionOptions", "master");

            builder.HasKey(o => o.Id);
            builder.Property(o => o.Id).UseIdentityColumn();

            builder.Property(o => o.OptionLabel).HasMaxLength(10).IsRequired();
            builder.Property(o => o.OptionText).IsRequired();
        }
    }
}
