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
            var candidates = await db.Candidates
                .Include(c => c.PipelineProgressHistory)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            int totalCandidates = candidates.Count;
            int applied = 0;
            int inProgress = 0;
            int offered = 0;
            int rejected = 0;
            int withdrawn = 0;

            foreach (var c in candidates)
            {
                var history = c.PipelineProgressHistory.OrderBy(p => p.RoundNumber).ToList();
                var r1 = history.FirstOrDefault(p => p.RoundNumber == 1);
                var r2 = history.FirstOrDefault(p => p.RoundNumber == 2);
                var r3 = history.FirstOrDefault(p => p.RoundNumber == 3);

                var r1Failed = r1?.Status?.Equals("failed", StringComparison.OrdinalIgnoreCase) == true || r1?.Status?.Equals("rejected", StringComparison.OrdinalIgnoreCase) == true;
                var r2Failed = r2?.Status?.Equals("failed", StringComparison.OrdinalIgnoreCase) == true || r2?.Status?.Equals("rejected", StringComparison.OrdinalIgnoreCase) == true;
                var r3Failed = r3?.Status?.Equals("failed", StringComparison.OrdinalIgnoreCase) == true || r3?.Status?.Equals("rejected", StringComparison.OrdinalIgnoreCase) == true;

                bool isTrulyRejected = c.Status?.Equals("rejected", StringComparison.OrdinalIgnoreCase) == true || r1Failed || (r2Failed && r3Failed);

                if (isTrulyRejected)
                {
                    rejected++;
                }
                else if (c.Status == "Offered")
                {
                    offered++;
                }
                else if (c.Status == "Withdrawn")
                {
                    withdrawn++;
                }
                else if (c.Status == "Applied")
                {
                    applied++;
                }
                else
                {
                    inProgress++;
                }
            }

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
                totalCandidates, applied, inProgress, offered, rejected, withdrawn, accepted,
                passRate, averageTimeToHireDays, offerAcceptanceRate);
        }
    }
}
