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
/// All V2 entities live under isolated schemas "examv2" and "staffv2", ensuring
/// zero collision or breaking changes with existing production tables.
/// </summary>
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Identity / RBAC (staff, master, staffv2 schemas)
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRefreshToken> UserRefreshTokens => Set<UserRefreshToken>();
    public DbSet<DirectorAccessLink> DirectorAccessLinks => Set<DirectorAccessLink>();

    // Master Data (master schema)
    public DbSet<MasterRole> MasterRoles => Set<MasterRole>();
    public DbSet<MasterDepartment> MasterDepartments => Set<MasterDepartment>();
    public DbSet<MasterHiringLocation> MasterHiringLocations => Set<MasterHiringLocation>();
    public DbSet<MasterEmploymentType> MasterEmploymentTypes => Set<MasterEmploymentType>();
    public DbSet<MasterExperienceLevel> MasterExperienceLevels => Set<MasterExperienceLevel>();
    public DbSet<RoleHiringProfile> RoleHiringProfiles => Set<RoleHiringProfile>();
    public DbSet<RoleAssessmentSectionRule> RoleAssessmentSectionRules => Set<RoleAssessmentSectionRule>();

    // V2 Central Blueprints & Question Bank (examv2 schema)
    public DbSet<AssessmentBlueprint> AssessmentBlueprints => Set<AssessmentBlueprint>();
    public DbSet<AssessmentBlueprintSectionRule> AssessmentBlueprintSectionRules => Set<AssessmentBlueprintSectionRule>();
    public DbSet<MasterQuestion> MasterQuestions => Set<MasterQuestion>();
    public DbSet<MasterQuestionOption> MasterQuestionOptions => Set<MasterQuestionOption>();

    // Audit & Outbox
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    // Vacancy Engine (vacancy schema)
    public DbSet<Vacancy> Vacancies => Set<Vacancy>();
    public DbSet<VacancyPipelineFlow> VacancyPipelineFlows => Set<VacancyPipelineFlow>();
    public DbSet<VacancyPipelineFlowRound> VacancyPipelineFlowRounds => Set<VacancyPipelineFlowRound>();
    public DbSet<VacancyAssessmentSection> VacancyAssessmentSections => Set<VacancyAssessmentSection>();
    public DbSet<VacancyRoundAssessment> VacancyRoundAssessments => Set<VacancyRoundAssessment>();
    public DbSet<VacancyQuestionPaper> VacancyQuestionPapers => Set<VacancyQuestionPaper>();
    public DbSet<VacancyQuestion> VacancyQuestions => Set<VacancyQuestion>();
    public DbSet<VacancyQuestionOption> VacancyQuestionOptions => Set<VacancyQuestionOption>();

    // Candidate Journey (candidate schema)
    public DbSet<CandidateEntity> Candidates => Set<CandidateEntity>();
    public DbSet<CandidateDocument> CandidateDocuments => Set<CandidateDocument>();
    public DbSet<CandidatePipelineProgress> CandidatePipelineProgresses => Set<CandidatePipelineProgress>();

    // V1 Legacy Exam Snapshot Engine (exam schema)
    public DbSet<CandidateExamSession> CandidateExamSessions => Set<CandidateExamSession>();
    public DbSet<CandidateExamSessionQuestion> CandidateExamSessionQuestions => Set<CandidateExamSessionQuestion>();
    public DbSet<CandidateExamSessionQuestionOption> CandidateExamSessionQuestionOptions => Set<CandidateExamSessionQuestionOption>();
    public DbSet<CandidateExamAnswer> CandidateExamAnswers => Set<CandidateExamAnswer>();
    public DbSet<CandidateExamAnswerOption> CandidateExamAnswerOptions => Set<CandidateExamAnswerOption>();

    // V2 Isolated Dynamic Exam Engine (examv2 schema)
    public DbSet<CandidateExamSessionV2> CandidateExamSessionsV2 => Set<CandidateExamSessionV2>();
    public DbSet<CandidateExamSessionQuestionV2> CandidateExamSessionQuestionsV2 => Set<CandidateExamSessionQuestionV2>();
    public DbSet<CandidateExamSessionQuestionOptionV2> CandidateExamSessionQuestionOptionsV2 => Set<CandidateExamSessionQuestionOptionV2>();
    public DbSet<CandidateExamAnswerV2> CandidateExamAnswersV2 => Set<CandidateExamAnswerV2>();
    public DbSet<CandidateExamAnswerOptionV2> CandidateExamAnswerOptionsV2 => Set<CandidateExamAnswerOptionV2>();
    public DbSet<ExamProctoringLog> ExamProctoringLogs => Set<ExamProctoringLog>();

    // Interviews & Offers (interview schema)
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<InterviewRoundDetail> InterviewRoundDetails => Set<InterviewRoundDetail>();
    public DbSet<OfferLetter> OfferLetters => Set<OfferLetter>();

    // QR Walk-in & Analytics (qr schema)
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
