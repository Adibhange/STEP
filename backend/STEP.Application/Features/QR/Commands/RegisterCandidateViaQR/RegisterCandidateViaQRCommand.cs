using MediatR;
using STEP.Application.Features.Candidates.Common;

namespace STEP.Application.Features.QR.Commands.RegisterCandidateViaQR
{
    /// <summary>Public self-registration via a scanned walk-in drive QR code — no staff auth involved.</summary>
    public record RegisterCandidateViaQRCommand(
        string Code,
        string FirstName,
        string LastName,
        string Email,
        string Phone,
        decimal TotalExperienceYears,
        decimal? CurrentCTC,
        decimal? ExpectedCTC,
        int? NoticePeriodDays,
        string? CurrentLocation,
        string? HighestQualification) : IRequest<CandidateDto>;
}
