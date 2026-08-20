using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
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

namespace STEP.Application.Common.Interfaces
{
    /// <summary>
    /// Application-layer abstraction over the EF Core DbContext, so command/query handlers
    /// never take a direct dependency on STEP.Persistence (Clean Architecture dependency rule).
    /// </summary>
    public interface IApplicationDbContext
    {
        // Identity / RBAC (staff & master schemas)
        DbSet<User> Users { get; }
        DbSet<Role> Roles { get; }
        DbSet<Permission> Permissions { get; }
        DbSet<RolePermission> RolePermissions { get; }
        DbSet<UserRefreshToken> UserRefreshTokens { get; }
        DbSet<DirectorAccessLink> DirectorAccessLinks { get; }

        // Master Data (master schema)
        DbSet<MasterRole> MasterRoles { get; }
        DbSet<MasterDepartment> MasterDepartments { get; }
        DbSet<MasterHiringLocation> MasterHiringLocations { get; }
        DbSet<MasterTestLocation> MasterTestLocations { get; }
        DbSet<MasterEmploymentType> MasterEmploymentTypes { get; }
        DbSet<MasterExperienceLevel> MasterExperienceLevels { get; }
        DbSet<RoleHiringProfile> RoleHiringProfiles { get; }
        DbSet<RoleAssessmentSectionRule> RoleAssessmentSectionRules { get; }

        // V2 Central Blueprints & Question Bank (examv2 schema)
        DbSet<AssessmentBlueprint> AssessmentBlueprints { get; }
        DbSet<AssessmentBlueprintSectionRule> AssessmentBlueprintSectionRules { get; }
        DbSet<MasterQuestion> MasterQuestions { get; }
        DbSet<MasterQuestionOption> MasterQuestionOptions { get; }

        // Audit & Outbox
        DbSet<AuditLog> AuditLogs { get; }
        DbSet<OutboxMessage> OutboxMessages { get; }

        // Vacancy Engine (vacancy schema)
        DbSet<Vacancy> Vacancies { get; }
        DbSet<VacancyTestLocation> VacancyTestLocations { get; }
        DbSet<VacancyPipelineFlow> VacancyPipelineFlows { get; }
        DbSet<VacancyPipelineFlowRound> VacancyPipelineFlowRounds { get; }
        DbSet<VacancyAssessmentSection> VacancyAssessmentSections { get; }
        DbSet<VacancyRoundAssessment> VacancyRoundAssessments { get; }
        DbSet<VacancyQuestionPaper> VacancyQuestionPapers { get; }
        DbSet<VacancyQuestion> VacancyQuestions { get; }
        DbSet<VacancyQuestionOption> VacancyQuestionOptions { get; }

        // Candidate Journey (candidate schema)
        DbSet<CandidateEntity> Candidates { get; }
        DbSet<CandidateDocument> CandidateDocuments { get; }
        DbSet<CandidatePipelineProgress> CandidatePipelineProgresses { get; }

        // V1 Legacy Exam Snapshot Engine (exam schema)
        DbSet<CandidateExamSession> CandidateExamSessions { get; }
        DbSet<CandidateExamSessionQuestion> CandidateExamSessionQuestions { get; }
        DbSet<CandidateExamSessionQuestionOption> CandidateExamSessionQuestionOptions { get; }
        DbSet<CandidateExamAnswer> CandidateExamAnswers { get; }
        DbSet<CandidateExamAnswerOption> CandidateExamAnswerOptions { get; }

        // V2 Isolated Dynamic Exam Engine (examv2 schema)
        DbSet<CandidateExamSessionV2> CandidateExamSessionsV2 { get; }
        DbSet<CandidateExamSessionQuestionV2> CandidateExamSessionQuestionsV2 { get; }
        DbSet<CandidateExamSessionQuestionOptionV2> CandidateExamSessionQuestionOptionsV2 { get; }
        DbSet<CandidateExamAnswerV2> CandidateExamAnswersV2 { get; }
        DbSet<CandidateExamAnswerOptionV2> CandidateExamAnswerOptionsV2 { get; }
        DbSet<ExamProctoringLog> ExamProctoringLogs { get; }

        // Interviews & Offers (interview schema)
        DbSet<Interview> Interviews { get; }
        DbSet<InterviewRoundDetail> InterviewRoundDetails { get; }
        DbSet<OfferLetter> OfferLetters { get; }

        // QR Walk-in & Analytics (qr schema)
        DbSet<QRCode> QRCodes { get; }
        DbSet<QRScanAnalytic> QRScanAnalytics { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
