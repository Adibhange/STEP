using MediatR;
using STEP.Application.Features.Candidates.Common;

namespace STEP.Application.Features.Candidates.Commands.RegisterCandidate
{
    /// <summary>
    /// Handles both Direct/Office and Walk-in registration — the frontend collects the same
    /// fields either way; RegistrationChannel is what distinguishes them.
    /// </summary>
    public record RegisterCandidateCommand(
        string FirstName,
        string LastName,
        string Email,
        string Phone,
        int VacancyId,
        string RegistrationChannel,
        string? ReferralEmployeeName,
        decimal TotalExperienceYears,
        decimal? CurrentCTC,
        decimal? ExpectedCTC,
        int? NoticePeriodDays,
        string? CurrentLocation,
        string? HighestQualification) : IRequest<CandidateDto>;
}
