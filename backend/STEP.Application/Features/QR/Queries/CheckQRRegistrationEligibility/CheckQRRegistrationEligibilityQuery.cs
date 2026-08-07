using System;
using MediatR;

namespace STEP.Application.Features.QR.Queries.CheckQRRegistrationEligibility
{
    public record QRRegistrationEligibilityDto(bool CanApply, DateTime? EligibleFrom, DateTime? LastAppliedAt);

    /// <summary>
    /// Live "can this person apply?" check the walk-in registration form calls as the candidate
    /// types their email/phone — lets it warn about the 90-day same-role cooldown before submit,
    /// without exposing anything about other candidates beyond that one yes/no + date.
    /// </summary>
    public record CheckQRRegistrationEligibilityQuery(string Code, string? Email, string? Phone) : IRequest<QRRegistrationEligibilityDto>;
}
