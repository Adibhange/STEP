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
        DbSet<User> Users { get; }
        DbSet<Role> Roles { get; }
        DbSet<Permission> Permissions { get; }
        DbSet<RolePermission> RolePermissions { get; }
        DbSet<UserRefreshToken> UserRefreshTokens { get; }

        DbSet<MasterRole> MasterRoles { get; }
        DbSet<MasterDepartment> MasterDepartments { get; }
        DbSet<MasterHiringLocation> MasterHiringLocations { get; }
        DbSet<MasterTestLocation> MasterTestLocations { get; }
        DbSet<MasterEmploymentType> MasterEmploymentTypes { get; }
        DbSet<MasterExperienceLevel> MasterExperienceLevels { get; }

        DbSet<AuditLog> AuditLogs { get; }

        DbSet<Vacancy> Vacancies { get; }
        DbSet<VacancyTestLocation> VacancyTestLocations { get; }
        DbSet<VacancyPipelineFlow> VacancyPipelineFlows { get; }
        DbSet<VacancyPipelineFlowRound> VacancyPipelineFlowRounds { get; }
        DbSet<VacancyAssessmentSection> VacancyAssessmentSections { get; }
        DbSet<VacancyRoundAssessment> VacancyRoundAssessments { get; }
        DbSet<VacancyQuestionPaper> VacancyQuestionPapers { get; }
        DbSet<VacancyQuestion> VacancyQuestions { get; }
        DbSet<VacancyQuestionOption> VacancyQuestionOptions { get; }

        DbSet<CandidateEntity> Candidates { get; }
        DbSet<CandidateDocument> CandidateDocuments { get; }
        DbSet<CandidatePipelineProgress> CandidatePipelineProgresses { get; }

        DbSet<CandidateExamSession> CandidateExamSessions { get; }
        DbSet<CandidateExamSessionQuestion> CandidateExamSessionQuestions { get; }
        DbSet<CandidateExamSessionQuestionOption> CandidateExamSessionQuestionOptions { get; }
        DbSet<CandidateExamAnswer> CandidateExamAnswers { get; }
        DbSet<CandidateExamAnswerOption> CandidateExamAnswerOptions { get; }

        DbSet<Interview> Interviews { get; }
        DbSet<InterviewRoundDetail> InterviewRoundDetails { get; }
        DbSet<OfferLetter> OfferLetters { get; }

        DbSet<OutboxMessage> OutboxMessages { get; }

        DbSet<QRCode> QRCodes { get; }
        DbSet<QRScanAnalytic> QRScanAnalytics { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
