namespace STEP.Application.Features.Reports.Common
{
    public record RecruitmentFunnelDto(
        int TotalCandidates,
        int AppliedCount,
        int InProgressCount,
        int OfferedCount,
        int RejectedCount,
        int WithdrawnCount,
        int JoinedCount,
        decimal PassRatePercentage,
        decimal? AverageTimeToHireDays,
        decimal OfferAcceptanceRate);
}
