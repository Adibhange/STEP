using System;

namespace STEP.Application.Features.Candidates.Common
{
    /// <summary>
    /// Enforces the 90-day "cooldown" on reapplying to the same vacancy — a candidate who already
    /// applied for a given role recently can't submit another application for that same role until
    /// the cooldown has elapsed. Shared by the public QR self-registration flow and its live
    /// eligibility-check endpoint, so the client-side warning and the server-side hard block can
    /// never disagree.
    /// </summary>
    public static class CandidateReapplicationPolicy
    {
        public const int CooldownDays = 90;

        /// <param name="mostRecentApplicationForSameVacancy">
        /// CreatedAt of the newest existing candidate row for this same vacancy matching the
        /// applicant's email or phone — null if they've never applied for this role before.
        /// </param>
        public static CandidateReapplicationEligibility Evaluate(DateTime? mostRecentApplicationForSameVacancy)
        {
            if (mostRecentApplicationForSameVacancy is not DateTime lastAppliedAt)
            {
                return new CandidateReapplicationEligibility(true, null, null);
            }

            var eligibleFrom = lastAppliedAt.AddDays(CooldownDays);
            if (DateTime.UtcNow >= eligibleFrom)
            {
                return new CandidateReapplicationEligibility(true, null, lastAppliedAt);
            }

            return new CandidateReapplicationEligibility(false, eligibleFrom, lastAppliedAt);
        }
    }

    public record CandidateReapplicationEligibility(bool CanApply, DateTime? EligibleFrom, DateTime? LastAppliedAt);
}
