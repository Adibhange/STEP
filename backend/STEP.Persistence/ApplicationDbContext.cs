using System.Reflection;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Identity;
using STEP.Domain.Entities.Master;
using STEP.Domain.Entities.Vacancy;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;
using STEP.Domain.Entities.Candidate;
using STEP.Domain.Entities.Exam;
using STEP.Domain.Entities.Interview;
using STEP.Domain.Entities.Notification;
using STEP.Domain.Entities.QR;
using STEP.Persistence.Seed;

namespace STEP.Persistence;

/// <summary>
/// Production Entity Framework Core 10 DbContext for STEP Enterprise ATS.
/// Phase 1: Identity/RBAC (Users, Roles, Permissions, RolePermissions, UserRefreshTokens),
/// Master Data taxonomies, and AuditLogs.
/// Phase 2: Vacancy Engine, Pipeline Flow split, Assessment Sections, decoupled Round
/// Assessments, and Question Paper publishing/locking.
/// Phase 3: Candidate Journey, Pipeline Progression, Document Repository.
/// Phase 4: Atomic Exam Snapshot, Evaluation, Result Publishing.
/// Phase 5: Interview Scheduling, Outbox Transactional Queue, Director PIN Offer Approvals.
/// Phase 6: QR Code Walk-in Drive, Executive Funnel Analytics.
/// Tables live under per-domain schemas — "staff" (Users/UserRefreshTokens), "master"
/// (Roles/Permissions/RolePermissions + the 5 master-data taxonomies), "audit" (AuditLogs),
/// "vacancy" (Vacancy engine/pipeline flow), "question" (question papers/questions/options),
/// "candidate" (candidates/documents/pipeline progress), "exam" (exam sessions/snapshots/answers),
/// "interview" (interviews/scorecards/offers), "notification" (outbox), "qr" (QR codes/scan
/// analytics) — so this context never touches any pre-existing table in the shared
/// InterviewTestPortal database (its separate ~34-table "dbo" schema is an entirely different
/// live system).
/// </summary>
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Identity / RBAC
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRefreshToken> UserRefreshTokens => Set<UserRefreshToken>();

    // Master Data
    public DbSet<MasterRole> MasterRoles => Set<MasterRole>();
    public DbSet<MasterDepartment> MasterDepartments => Set<MasterDepartment>();
    public DbSet<MasterHiringLocation> MasterHiringLocations => Set<MasterHiringLocation>();
    public DbSet<MasterTestLocation> MasterTestLocations => Set<MasterTestLocation>();
    public DbSet<MasterEmploymentType> MasterEmploymentTypes => Set<MasterEmploymentType>();
    public DbSet<MasterExperienceLevel> MasterExperienceLevels => Set<MasterExperienceLevel>();

    // Audit
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    // Vacancy Engine (Phase 2)
    public DbSet<Vacancy> Vacancies => Set<Vacancy>();
    public DbSet<VacancyTestLocation> VacancyTestLocations => Set<VacancyTestLocation>();
    public DbSet<VacancyPipelineFlow> VacancyPipelineFlows => Set<VacancyPipelineFlow>();
    public DbSet<VacancyPipelineFlowRound> VacancyPipelineFlowRounds => Set<VacancyPipelineFlowRound>();
    public DbSet<VacancyAssessmentSection> VacancyAssessmentSections => Set<VacancyAssessmentSection>();
    public DbSet<VacancyRoundAssessment> VacancyRoundAssessments => Set<VacancyRoundAssessment>();
    public DbSet<VacancyQuestionPaper> VacancyQuestionPapers => Set<VacancyQuestionPaper>();
    public DbSet<VacancyQuestion> VacancyQuestions => Set<VacancyQuestion>();
    public DbSet<VacancyQuestionOption> VacancyQuestionOptions => Set<VacancyQuestionOption>();

    // Candidate Journey (Phase 3)
    public DbSet<CandidateEntity> Candidates => Set<CandidateEntity>();
    public DbSet<CandidateDocument> CandidateDocuments => Set<CandidateDocument>();
    public DbSet<CandidatePipelineProgress> CandidatePipelineProgresses => Set<CandidatePipelineProgress>();

    // Exam Snapshot Engine (Phase 4)
    public DbSet<CandidateExamSession> CandidateExamSessions => Set<CandidateExamSession>();
    public DbSet<CandidateExamSessionQuestion> CandidateExamSessionQuestions => Set<CandidateExamSessionQuestion>();
    public DbSet<CandidateExamSessionQuestionOption> CandidateExamSessionQuestionOptions => Set<CandidateExamSessionQuestionOption>();
    public DbSet<CandidateExamAnswer> CandidateExamAnswers => Set<CandidateExamAnswer>();
    public DbSet<CandidateExamAnswerOption> CandidateExamAnswerOptions => Set<CandidateExamAnswerOption>();

    // Interviews & Offers (Phase 5)
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<InterviewRoundDetail> InterviewRoundDetails => Set<InterviewRoundDetail>();
    public DbSet<OfferLetter> OfferLetters => Set<OfferLetter>();

    // Outbox (Phase 5)
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    // QR Walk-in & Analytics (Phase 6)
    public DbSet<QRCode> QRCodes => Set<QRCode>();
    public DbSet<QRScanAnalytic> QRScanAnalytics => Set<QRScanAnalytic>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        IdentitySeedData.Seed(modelBuilder);
        MasterDataSeedData.Seed(modelBuilder);
    }
}
