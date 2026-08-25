using MediatR;
using STEP.Application.Features.Candidates.Common;

namespace STEP.Application.Features.QR.Commands.RegisterCandidateViaQR
{
    /// <summary>Public self-registration via a scanned walk-in drive QR code or direct application link.</summary>
    public record RegisterCandidateViaQRCommand(
        string Code,
        string FirstName,
        string LastName,
        string Email,
        string Phone,
        decimal TotalExperienceYears,
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
        string? ResumeContentType = null) : IRequest<CandidateDto>;
}
