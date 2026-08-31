using System;
using MediatR;
using STEP.Application.Features.Candidates.Common;

namespace STEP.Application.Features.QR.Commands.RegisterUniversalCandidate
{
    public record UniversalCandidateRegistrationResultDto(
        CandidateDto Candidate,
        string CandidateCode,
        string CandidateName,
        string RoleTitle,
        string HiringLocation,
        string Channel,
        string CurrentStage,
        string? ExamPasscode = null,
        string? ExamPortalUrl = null);

    /// <summary>
    /// Open Candidate Universal QR Registration Command with smart vacancy auto-matching.
    /// Eliminates the need for pre-printed individual vacancy QR campaigns.
    /// </summary>
    public record RegisterUniversalCandidateCommand(
        string FirstName,
        string LastName,
        string Email,
        string Phone,
        string RoleIdentifier,
        string LocationIdentifier,
        string ApplicationChannel,
        decimal TotalExperienceYears,
        string? SeniorityBracket = null,
        decimal? CurrentCTC = null,
        decimal? ExpectedCTC = null,
        int? NoticePeriodDays = null,
        string? CurrentLocation = null,
        string? HighestQualification = null,
        string? Gender = null,
        string? Dob = null,
        string? CurrentCompany = null,
        string? CurrentDesignation = null,
        string? InstitutionName = null,
        int? YearOfPassing = null,
        decimal? MarksPercentage = null,
        string? RefType = null,
        string? RefName = null,
        string? RefMobile = null,
        string? AvatarUrl = null,
        string? PhotoBase64 = null,
        string? PhotoFileName = null,
        string? PhotoContentType = null,
        string? ResumeBase64 = null,
        string? ResumeFileName = null,
        string? ResumeContentType = null) : IRequest<UniversalCandidateRegistrationResultDto>;
}
