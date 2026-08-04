using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Reports.Common;

namespace STEP.Application.Features.Reports.Queries.GetRecruitmentFunnel
{
    /// <summary>Executive dashboard funnel KPIs, computed live against real Candidates/CandidatePipelineProgress/OfferLetters data.</summary>
    public class GetRecruitmentFunnelQueryHandler(IApplicationDbContext db) : IRequestHandler<GetRecruitmentFunnelQuery, RecruitmentFunnelDto>
    {
        public async Task<RecruitmentFunnelDto> Handle(GetRecruitmentFunnelQuery request, CancellationToken cancellationToken)
        {
            var totalCandidates = await db.Candidates.CountAsync(cancellationToken);
            var applied = await db.Candidates.CountAsync(c => c.Status == "Applied", cancellationToken);
            var inProgress = await db.Candidates.CountAsync(c => c.Status == "In-Progress", cancellationToken);
            var offered = await db.Candidates.CountAsync(c => c.Status == "Offered", cancellationToken);
            var rejected = await db.Candidates.CountAsync(c => c.Status == "Rejected", cancellationToken);
            var withdrawn = await db.Candidates.CountAsync(c => c.Status == "Withdrawn", cancellationToken);

            var passedRounds = await db.CandidatePipelineProgresses.CountAsync(p => p.Status == "Passed", cancellationToken);
            var failedRounds = await db.CandidatePipelineProgresses.CountAsync(p => p.Status == "Failed", cancellationToken);
            var evaluatedRounds = passedRounds + failedRounds;
            var passRate = evaluatedRounds > 0 ? Math.Round((decimal)passedRounds / evaluatedRounds * 100, 2) : 0;

            var hireTimings = await db.OfferLetters
                .Where(o => o.Status == "Approved" || o.Status == "Sent" || o.Status == "Accepted")
                .Select(o => new { o.CreatedAt, CandidateCreatedAt = o.Candidate.CreatedAt })
                .ToListAsync(cancellationToken);

            decimal? averageTimeToHireDays = hireTimings.Count != 0
                ? Math.Round((decimal)hireTimings.Average(t => (t.CreatedAt - t.CandidateCreatedAt).TotalDays), 1)
                : null;

            var accepted = await db.OfferLetters.CountAsync(o => o.Status == "Accepted", cancellationToken);
            var declined = await db.OfferLetters.CountAsync(o => o.Status == "Declined", cancellationToken);
            var decidedOffers = accepted + declined;
            var offerAcceptanceRate = decidedOffers > 0 ? Math.Round((decimal)accepted / decidedOffers * 100, 2) : 0;

            return new RecruitmentFunnelDto(
                totalCandidates, applied, inProgress, offered, rejected, withdrawn,
                passRate, averageTimeToHireDays, offerAcceptanceRate);
        }
    }
}
