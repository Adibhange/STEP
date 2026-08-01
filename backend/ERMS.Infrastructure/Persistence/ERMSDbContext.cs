using Microsoft.EntityFrameworkCore;
using ERMS.Domain.Common;
using ERMS.Domain.Entities.Master;
using ERMS.Domain.Entities.Staff;
using ERMS.Domain.Entities.Vacancy;
using ERMS.Domain.Entities.Candidate;
using ERMS.Domain.Entities.Question;
using ERMS.Domain.Entities.Exam;
using ERMS.Domain.Entities.Interview;
using ERMS.Domain.Entities.Notification;
using ERMS.Domain.Entities.Audit;

namespace ERMS.Infrastructure.Persistence
{
    public class ERMSDbContext : DbContext
    {
        public ERMSDbContext(DbContextOptions<ERMSDbContext> options) : base(options) { }

        // Master Schema
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
        public DbSet<Location> Locations => Set<Location>();

        // Staff Schema
        public DbSet<User> Users => Set<User>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<UserSession> UserSessions => Set<UserSession>();

        // Vacancy Schema
        public DbSet<Vacancy> Vacancies => Set<Vacancy>();
        public DbSet<VacancyStage> VacancyStages => Set<VacancyStage>();

        // Candidate Schema
        public DbSet<Candidate> Candidates => Set<Candidate>();
        public DbSet<CandidateEducation> CandidateEducations => Set<CandidateEducation>();
        public DbSet<CandidateWorkExperience> CandidateWorkExperiences => Set<CandidateWorkExperience>();
        public DbSet<CandidateDocument> CandidateDocuments => Set<CandidateDocument>();

        // Question Schema
        public DbSet<QuestionBank> QuestionBanks => Set<QuestionBank>();
        public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
        public DbSet<AssessmentTemplate> AssessmentTemplates => Set<AssessmentTemplate>();
        public DbSet<TemplateSection> TemplateSections => Set<TemplateSection>();

        // Exam Schema
        public DbSet<ExamAssignment> ExamAssignments => Set<ExamAssignment>();
        public DbSet<ExamSession> ExamSessions => Set<ExamSession>();
        public DbSet<ExamAnswer> ExamAnswers => Set<ExamAnswer>();
        public DbSet<ExamViolation> ExamViolations => Set<ExamViolation>();

        // Interview Schema
        public DbSet<CandidateStageProgress> CandidateStageProgresses => Set<CandidateStageProgress>();
        public DbSet<InterviewSchedule> InterviewSchedules => Set<InterviewSchedule>();
        public DbSet<InterviewFeedback> InterviewFeedbacks => Set<InterviewFeedback>();

        // Notification & Audit
        public DbSet<OutboxNotification> OutboxNotifications => Set<OutboxNotification>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Master Schema Config
            modelBuilder.Entity<Role>(entity => {
                entity.ToTable("Roles", "master");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.RoleName).HasMaxLength(50).IsUnicode(false).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(250).IsUnicode(false);
                entity.Property(e => e.RowVersion).IsRowVersion();
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<Permission>(entity => {
                entity.ToTable("Permissions", "master");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Module).HasMaxLength(50).IsUnicode(false).IsRequired();
                entity.Property(e => e.Action).HasMaxLength(50).IsUnicode(false).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(200).IsUnicode(false);
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<RolePermission>(entity => {
                entity.ToTable("RolePermissions", "master");
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Role).WithMany().HasForeignKey(e => e.RoleId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Permission).WithMany().HasForeignKey(e => e.PermissionId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Location>(entity => {
                entity.ToTable("Locations", "master");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.City).HasMaxLength(100).IsUnicode(false).IsRequired();
                entity.Property(e => e.State).HasMaxLength(100).IsUnicode(false).IsRequired();
                entity.Property(e => e.Country).HasMaxLength(100).IsUnicode(false).HasDefaultValue("India");
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            // Staff Schema Config
            modelBuilder.Entity<User>(entity => {
                entity.ToTable("Users", "staff");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.EmployeeCode).HasMaxLength(30).IsUnicode(false).IsRequired();
                entity.Property(e => e.FirstName).HasMaxLength(50).IsRequired();
                entity.Property(e => e.LastName).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Email).HasMaxLength(150).IsUnicode(false).IsRequired();
                entity.Property(e => e.PasswordHash).HasMaxLength(256).IsUnicode(false).IsRequired();
                entity.Property(e => e.PasswordSalt).HasMaxLength(256).IsUnicode(false).IsRequired();
                entity.Property(e => e.PinHash).HasMaxLength(256).IsUnicode(false);
                entity.Property(e => e.RowVersion).IsRowVersion();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.EmployeeCode).IsUnique();
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<UserRole>(entity => {
                entity.ToTable("UserRoles", "staff");
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User).WithMany(u => u.UserRoles).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Role).WithMany().HasForeignKey(e => e.RoleId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserSession>(entity => {
                entity.ToTable("UserSessions", "staff");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.RefreshToken).HasMaxLength(256).IsUnicode(false).IsRequired();
                entity.Property(e => e.IpAddress).HasMaxLength(45).IsUnicode(false);
                entity.Property(e => e.UserAgent).HasMaxLength(500).IsUnicode(false);
                entity.Property(e => e.DeviceFingerprint).HasMaxLength(128).IsUnicode(false);
                entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            });

            // Vacancy Schema Config
            modelBuilder.Entity<Vacancy>(entity => {
                entity.ToTable("Vacancies", "vacancy");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.VacancyCode).HasMaxLength(30).IsUnicode(false).IsRequired();
                entity.Property(e => e.Title).HasMaxLength(150).IsRequired();
                entity.Property(e => e.Department).HasMaxLength(100).IsUnicode(false).IsRequired();
                entity.Property(e => e.MinExperienceYears).HasColumnType("decimal(4,1)");
                entity.Property(e => e.MaxExperienceYears).HasColumnType("decimal(4,1)");
                entity.Property(e => e.Status).HasMaxLength(30).IsUnicode(false).HasDefaultValue("Draft");
                entity.Property(e => e.RowVersion).IsRowVersion();
                entity.HasOne(e => e.Location).WithMany().HasForeignKey(e => e.LocationId).OnDelete(DeleteBehavior.Restrict);
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<VacancyStage>(entity => {
                entity.ToTable("VacancyStages", "vacancy");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.StageName).HasMaxLength(100).IsUnicode(false).IsRequired();
                entity.Property(e => e.StageType).HasMaxLength(50).IsUnicode(false).IsRequired();
                entity.Property(e => e.PassMarkPercentage).HasColumnType("decimal(5,2)");
                entity.HasOne(e => e.Vacancy).WithMany(v => v.VacancyStages).HasForeignKey(e => e.VacancyId).OnDelete(DeleteBehavior.Cascade);
            });

            // Candidate Schema Config
            modelBuilder.Entity<Candidate>(entity => {
                entity.ToTable("Candidates", "candidate");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CandidateCode).HasMaxLength(30).IsUnicode(false).IsRequired();
                entity.Property(e => e.SourceType).HasMaxLength(50).IsUnicode(false).IsRequired();
                entity.Property(e => e.FirstName).HasMaxLength(50).IsRequired();
                entity.Property(e => e.LastName).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Email).HasMaxLength(150).IsUnicode(false).IsRequired();
                entity.Property(e => e.Mobile).HasMaxLength(20).IsUnicode(false).IsRequired();
                entity.Property(e => e.Gender).HasMaxLength(20).IsUnicode(false);
                entity.Property(e => e.Address).HasMaxLength(300);
                entity.Property(e => e.CurrentSalary).HasColumnType("decimal(12,2)");
                entity.Property(e => e.ExpectedSalary).HasColumnType("decimal(12,2)");
                entity.Property(e => e.PhotoPath).HasMaxLength(500).IsUnicode(false);
                entity.Property(e => e.ResumePath).HasMaxLength(500).IsUnicode(false);
                entity.Property(e => e.Status).HasMaxLength(50).IsUnicode(false).HasDefaultValue("Registered");
                entity.Property(e => e.RowVersion).IsRowVersion();
                entity.HasIndex(e => e.Email);
                entity.HasIndex(e => e.CandidateCode).IsUnique();
                entity.HasOne(e => e.Vacancy).WithMany().HasForeignKey(e => e.VacancyId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Location).WithMany().HasForeignKey(e => e.LocationId).OnDelete(DeleteBehavior.Restrict);
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<CandidateEducation>(entity => {
                entity.ToTable("Education", "candidate");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Degree).HasMaxLength(100).IsUnicode(false).IsRequired();
                entity.Property(e => e.College).HasMaxLength(200).IsRequired();
                entity.Property(e => e.University).HasMaxLength(200).IsRequired();
                entity.Property(e => e.CGPA).HasColumnType("decimal(4,2)");
                entity.HasOne(e => e.Candidate).WithMany(c => c.EducationHistory).HasForeignKey(e => e.CandidateId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<CandidateWorkExperience>(entity => {
                entity.ToTable("WorkExperience", "candidate");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CompanyName).HasMaxLength(150).IsRequired();
                entity.Property(e => e.Designation).HasMaxLength(100).IsRequired();
                entity.HasOne(e => e.Candidate).WithMany(c => c.WorkHistory).HasForeignKey(e => e.CandidateId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<CandidateDocument>(entity => {
                entity.ToTable("Documents", "candidate");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DocumentType).HasMaxLength(50).IsUnicode(false).IsRequired();
                entity.Property(e => e.FilePath).HasMaxLength(500).IsUnicode(false).IsRequired();
                entity.HasOne(e => e.Candidate).WithMany(c => c.Documents).HasForeignKey(e => e.CandidateId).OnDelete(DeleteBehavior.Cascade);
            });

            // Question Schema Config
            modelBuilder.Entity<QuestionBank>(entity => {
                entity.ToTable("QuestionBank", "question");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.QuestionType).HasMaxLength(30).IsUnicode(false).IsRequired();
                entity.Property(e => e.Category).HasMaxLength(100).IsUnicode(false);
                entity.Property(e => e.DifficultyLevel).HasMaxLength(20).IsUnicode(false).HasDefaultValue("Medium");
                entity.Property(e => e.Title).HasMaxLength(500).IsRequired();
                entity.Property(e => e.Marks).HasColumnType("decimal(5,2)");
                entity.Property(e => e.NegativeMarks).HasColumnType("decimal(5,2)");
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<QuestionOption>(entity => {
                entity.ToTable("QuestionOptions", "question");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OptionText).HasMaxLength(1000).IsRequired();
                entity.HasOne(e => e.Question).WithMany(q => q.Options).HasForeignKey(e => e.QuestionId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<AssessmentTemplate>(entity => {
                entity.ToTable("AssessmentTemplates", "question");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).HasMaxLength(150).IsRequired();
                entity.Property(e => e.PassPercentage).HasColumnType("decimal(5,2)");
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<TemplateSection>(entity => {
                entity.ToTable("TemplateSections", "question");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SectionName).HasMaxLength(100).IsUnicode(false).IsRequired();
                entity.HasOne(e => e.Template).WithMany(t => t.Sections).HasForeignKey(e => e.TemplateId).OnDelete(DeleteBehavior.Cascade);
            });

            // Exam Schema Config
            modelBuilder.Entity<ExamAssignment>(entity => {
                entity.ToTable("ExamAssignments", "exam");
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Vacancy).WithMany().HasForeignKey(e => e.VacancyId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Template).WithMany().HasForeignKey(e => e.TemplateId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ExamSession>(entity => {
                entity.ToTable("ExamSessions", "exam");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SessionToken).HasMaxLength(100).IsUnicode(false).IsRequired();
                entity.Property(e => e.Status).HasMaxLength(30).IsUnicode(false).HasDefaultValue("Created");
                entity.Property(e => e.TotalObtainedMarks).HasColumnType("decimal(6,2)");
                entity.Property(e => e.FinalResult).HasMaxLength(20).IsUnicode(false).HasDefaultValue("PendingEvaluation");
                entity.Property(e => e.RiskScore).HasColumnType("decimal(5,2)").HasDefaultValue(0.0m);
                entity.Property(e => e.RowVersion).IsRowVersion();
                entity.HasIndex(e => e.SessionToken).IsUnique();
                entity.HasOne(e => e.Candidate).WithMany().HasForeignKey(e => e.CandidateId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.ExamAssignment).WithMany().HasForeignKey(e => e.ExamAssignmentId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ExamAnswer>(entity => {
                entity.ToTable("ExamAnswers", "exam");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SelectedOptionIds).HasMaxLength(200).IsUnicode(false);
                entity.Property(e => e.ObtainedMarks).HasColumnType("decimal(5,2)");
                entity.HasOne(e => e.ExamSession).WithMany(s => s.Answers).HasForeignKey(e => e.ExamSessionId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Question).WithMany().HasForeignKey(e => e.QuestionId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.EvaluatedByUser).WithMany().HasForeignKey(e => e.EvaluatedByUserId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ExamViolation>(entity => {
                entity.ToTable("ExamViolations", "exam");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ViolationType).HasMaxLength(50).IsUnicode(false).IsRequired();
                entity.Property(e => e.SeverityWeight).HasColumnType("decimal(4,2)");
                entity.Property(e => e.Details).HasMaxLength(500);
                entity.HasOne(e => e.ExamSession).WithMany(s => s.Violations).HasForeignKey(e => e.ExamSessionId).OnDelete(DeleteBehavior.Cascade);
            });

            // Interview Schema Config
            modelBuilder.Entity<CandidateStageProgress>(entity => {
                entity.ToTable("CandidateStageProgress", "interview");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.StageStatus).HasMaxLength(30).IsUnicode(false).HasDefaultValue("Scheduled");
                entity.HasOne(e => e.Candidate).WithMany().HasForeignKey(e => e.CandidateId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.VacancyStage).WithMany().HasForeignKey(e => e.VacancyStageId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<InterviewSchedule>(entity => {
                entity.ToTable("InterviewSchedules", "interview");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.MeetingLink).HasMaxLength(500).IsUnicode(false);
                entity.Property(e => e.LocationDetails).HasMaxLength(200);
                entity.HasOne(e => e.Progress).WithMany().HasForeignKey(e => e.ProgressId).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.InterviewerUser).WithMany().HasForeignKey(e => e.InterviewerUserId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<InterviewFeedback>(entity => {
                entity.ToTable("InterviewFeedbacks", "interview");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Recommendation).HasMaxLength(30).IsUnicode(false).HasDefaultValue("Hire");
                entity.HasOne(e => e.Schedule).WithMany().HasForeignKey(e => e.ScheduleId).OnDelete(DeleteBehavior.Cascade);
            });

            // Notification & Audit Config
            modelBuilder.Entity<OutboxNotification>(entity => {
                entity.ToTable("Outbox", "notification");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Channel).HasMaxLength(30).IsUnicode(false).IsRequired();
                entity.Property(e => e.Recipient).HasMaxLength(150).IsUnicode(false).IsRequired();
                entity.Property(e => e.Subject).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Status).HasMaxLength(20).IsUnicode(false).HasDefaultValue("Pending");
            });

            modelBuilder.Entity<AuditLog>(entity => {
                entity.ToTable("AuditLogs", "audit");
                entity.HasKey(e => e.AuditId);
                entity.Property(e => e.Action).HasMaxLength(100).IsUnicode(false).IsRequired();
                entity.Property(e => e.EntityName).HasMaxLength(100).IsUnicode(false).IsRequired();
                entity.Property(e => e.EntityId).HasMaxLength(50).IsUnicode(false).IsRequired();
                entity.Property(e => e.IpAddress).HasMaxLength(45).IsUnicode(false);
            });
        }
    }
}
