using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Exam;

namespace STEP.Persistence.Configurations
{
    public class CandidateExamSessionV2Configuration : IEntityTypeConfiguration<CandidateExamSessionV2>
    {
        public void Configure(EntityTypeBuilder<CandidateExamSessionV2> builder)
        {
            builder.ToTable("CandidateExamSessions", "examv2");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).UseIdentityColumn();

            builder.Property(e => e.SessionToken).HasMaxLength(80).IsRequired();
            builder.Property(e => e.CandidateTier).HasMaxLength(30).IsRequired();
            builder.Property(e => e.RolePrimaryLanguage).HasMaxLength(50).IsRequired();
            builder.Property(e => e.SessionStatus).HasMaxLength(30).HasDefaultValue("Created").IsRequired();
            builder.Property(e => e.EvaluationStatus).HasMaxLength(30).HasDefaultValue("Pending").IsRequired();
            builder.Property(e => e.LockedSectionIdsCsv).HasMaxLength(300);
            builder.Property(e => e.AssessmentIntegrityScore).HasColumnType("decimal(5,2)").HasDefaultValue(100.00m);
            builder.Property(e => e.TotalMarks).HasColumnType("decimal(6,2)").HasDefaultValue(0.00m);
            builder.Property(e => e.TotalScore).HasColumnType("decimal(6,2)").HasDefaultValue(0.00m);
            builder.Property(e => e.Percentage).HasColumnType("decimal(5,2)").HasDefaultValue(0.00m);
            builder.Property(e => e.PassingPercentage).HasColumnType("decimal(5,2)").HasDefaultValue(70.00m);
            builder.Property(e => e.ResultStatus).HasMaxLength(20).HasDefaultValue("Pending").IsRequired();
            builder.Property(e => e.RowVersion).IsRowVersion();

            builder.HasIndex(e => e.SessionToken).IsUnique();

            builder.HasOne(e => e.Candidate)
                .WithMany()
                .HasForeignKey(e => e.CandidateId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.Vacancy)
                .WithMany()
                .HasForeignKey(e => e.VacancyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.AssessmentBlueprint)
                .WithMany()
                .HasForeignKey(e => e.AssessmentBlueprintId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.CandidatePipelineProgress)
                .WithMany()
                .HasForeignKey(e => e.CandidatePipelineProgressId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.EvaluatorUser)
                .WithMany()
                .HasForeignKey(e => e.EvaluatorUserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(e => e.Questions)
                .WithOne(q => q.CandidateExamSession)
                .HasForeignKey(q => q.CandidateExamSessionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Answers)
                .WithOne(a => a.CandidateExamSession)
                .HasForeignKey(a => a.CandidateExamSessionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.ProctoringLogs)
                .WithOne(l => l.CandidateExamSession)
                .HasForeignKey(l => l.CandidateExamSessionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class CandidateExamSessionQuestionV2Configuration : IEntityTypeConfiguration<CandidateExamSessionQuestionV2>
    {
        public void Configure(EntityTypeBuilder<CandidateExamSessionQuestionV2> builder)
        {
            builder.ToTable("CandidateExamSessionQuestions", "examv2");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).UseIdentityColumn();

            builder.Property(e => e.SectionName).HasMaxLength(60).IsRequired();
            builder.Property(e => e.SectionType).HasMaxLength(30).IsRequired();
            builder.Property(e => e.QuestionType).HasMaxLength(30).IsRequired();
            builder.Property(e => e.QuestionText).IsRequired();
            builder.Property(e => e.Marks).HasColumnType("decimal(5,2)").HasDefaultValue(1.00m);
            builder.Property(e => e.ProgrammingLanguage).HasMaxLength(50);
            builder.Property(e => e.QuestionSnapshotJson).IsRequired();

            builder.HasIndex(e => new { e.CandidateExamSessionId, e.DisplayOrder }).IsUnique();

            builder.HasOne(e => e.SectionRule)
                .WithMany()
                .HasForeignKey(e => e.SectionRuleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.OriginalMasterQuestion)
                .WithMany()
                .HasForeignKey(e => e.OriginalMasterQuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(e => e.Options)
                .WithOne(o => o.CandidateExamSessionQuestion)
                .HasForeignKey(o => o.CandidateExamSessionQuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class CandidateExamSessionQuestionOptionV2Configuration : IEntityTypeConfiguration<CandidateExamSessionQuestionOptionV2>
    {
        public void Configure(EntityTypeBuilder<CandidateExamSessionQuestionOptionV2> builder)
        {
            builder.ToTable("CandidateExamSessionQuestionOptions", "examv2");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).UseIdentityColumn();

            builder.Property(e => e.DisplayOptionLabel).HasMaxLength(5).IsRequired();
            builder.Property(e => e.OptionText).IsRequired();

            builder.HasOne(e => e.OriginalMasterQuestionOption)
                .WithMany()
                .HasForeignKey(e => e.OriginalMasterQuestionOptionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }

    public class CandidateExamAnswerV2Configuration : IEntityTypeConfiguration<CandidateExamAnswerV2>
    {
        public void Configure(EntityTypeBuilder<CandidateExamAnswerV2> builder)
        {
            builder.ToTable("CandidateExamAnswers", "examv2");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).UseIdentityColumn();

            builder.Property(e => e.MarksObtained).HasColumnType("decimal(5,2)").HasDefaultValue(0.00m);
            builder.Property(e => e.EvaluationStatus).HasMaxLength(30).HasDefaultValue("Pending").IsRequired();

            builder.HasIndex(e => new { e.CandidateExamSessionId, e.CandidateExamSessionQuestionId }).IsUnique();

            builder.HasOne(e => e.CandidateExamSessionQuestion)
                .WithMany()
                .HasForeignKey(e => e.CandidateExamSessionQuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(e => e.SelectedOptions)
                .WithOne(o => o.CandidateExamAnswer)
                .HasForeignKey(o => o.CandidateExamAnswerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class CandidateExamAnswerOptionV2Configuration : IEntityTypeConfiguration<CandidateExamAnswerOptionV2>
    {
        public void Configure(EntityTypeBuilder<CandidateExamAnswerOptionV2> builder)
        {
            builder.ToTable("CandidateExamAnswerOptions", "examv2");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).UseIdentityColumn();

            builder.HasOne(e => e.CandidateExamSessionQuestionOption)
                .WithMany()
                .HasForeignKey(e => e.CandidateExamSessionQuestionOptionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }

    public class ExamProctoringLogConfiguration : IEntityTypeConfiguration<ExamProctoringLog>
    {
        public void Configure(EntityTypeBuilder<ExamProctoringLog> builder)
        {
            builder.ToTable("ExamProctoringLogs", "examv2");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).UseIdentityColumn();

            builder.Property(e => e.EventType).HasMaxLength(30).IsRequired();
            builder.Property(e => e.ClientIp).HasMaxLength(45);
            builder.Property(e => e.UserAgent).HasMaxLength(300);

            builder.HasIndex(e => e.CandidateExamSessionId);
        }
    }
}
