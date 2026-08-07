using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;

namespace STEP.Application.Features.Candidates.Queries.GetCandidates
{
    public class GetCandidatesQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser) : IRequestHandler<GetCandidatesQuery, CandidateListResultDto>
    {
        public async Task<CandidateListResultDto> Handle(GetCandidatesQuery request, CancellationToken cancellationToken)
        {
            var query = db.Candidates
                .Include(c => c.Vacancy).ThenInclude(v => v.HiringLocation)
                .Include(c => c.Vacancy).ThenInclude(v => v.TestLocations).ThenInclude(tl => tl.MasterTestLocation)
                .Include(c => c.PipelineProgressHistory)
                .AsNoTracking().AsQueryable();

            if (currentUser.Role == "Interviewer" && currentUser.UserId is int interviewerId)
            {
                query = query.Where(c => db.Interviews.Any(i => i.CandidateId == c.Id && i.InterviewerUserId == interviewerId));
            }

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var term = request.Search.Trim();
                query = query.Where(c => c.FirstName.Contains(term) || c.LastName.Contains(term)
                    || c.Email.Contains(term) || c.CandidateCode.Contains(term) || c.Phone.Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                query = query.Where(c => c.Status == request.Status);
            }

            if (request.VacancyId is int vacancyId)
            {
                query = query.Where(c => c.VacancyId == vacancyId);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var pageIndex = request.PageIndex < 1 ? 1 : request.PageIndex;
            var pageSize = request.PageSize is < 1 or > 200 ? 20 : request.PageSize;

            var rawCandidates = await query
                .OrderByDescending(c => c.Id)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var candidateIds = rawCandidates.Select(c => c.Id).ToList();

            var activeInterviews = await db.Interviews
                .Include(i => i.InterviewerUser)
                .Where(i => candidateIds.Contains(i.CandidateId) && i.Status != "Cancelled")
                .OrderByDescending(i => i.Id)
                .ToListAsync(cancellationToken);

            var interviewByCandidate = activeInterviews
                .GroupBy(i => i.CandidateId)
                .ToDictionary(g => g.Key, g => g.First());

            var evaluatorUserIds = rawCandidates
                .SelectMany(c => c.PipelineProgressHistory)
                .Where(p => p.EvaluatorId != null)
                .Select(p => p.EvaluatorId!.Value)
                .Distinct()
                .ToList();

            var evaluatorNames = await db.Users
                .Where(u => evaluatorUserIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim(), cancellationToken);

            var items = new List<CandidateSummaryDto>();

            foreach (var c in rawCandidates)
            {
                string? assignedInterviewer = null;
                if (interviewByCandidate.TryGetValue(c.Id, out var interview) && interview.InterviewerUser != null)
                {
                    assignedInterviewer = $"{interview.InterviewerUser.FirstName} {interview.InterviewerUser.LastName}".Trim();
                }
                else
                {
                    var activeProgress = c.PipelineProgressHistory.FirstOrDefault(p => p.RoundTitle == c.CurrentStage)
                        ?? c.PipelineProgressHistory.OrderByDescending(p => p.RoundNumber).FirstOrDefault();

                    if (activeProgress?.EvaluatorId != null)
                    {
                        assignedInterviewer = evaluatorNames.GetValueOrDefault(activeProgress.EvaluatorId.Value);
                    }
                    else
                    {
                        var anyEvaluator = c.PipelineProgressHistory.Where(p => p.EvaluatorId != null).Select(p => p.EvaluatorId!.Value).FirstOrDefault();
                        if (anyEvaluator != 0)
                        {
                            assignedInterviewer = evaluatorNames.GetValueOrDefault(anyEvaluator);
                        }
                    }
                }

                // candidate.Status is the authoritative terminal/interim status maintained by
                // CandidateAdvancementService — trust it directly instead of recomputing from raw
                // round data. (A prior version of this recompute hardcoded a 3-round assumption,
                // which silently downgraded real "Rejected" candidates back to "In-Progress" for
                // any 2-round or 4+-round pipeline flow — those are real, per-vacancy-configurable
                // shapes, not hypothetical.) "Applied" (pre-pipeline-assignment) still collapses to
                // "In-Progress" for display, matching the existing list-view terminology.
                string effectiveStatus = c.Status is "Offered" or "Hired" or "Rejected" ? c.Status : "In-Progress";

                string hiringLocation = c.Vacancy?.HiringLocation?.Name ?? c.CurrentLocation ?? "Primary Center";
                string testLocation = c.Vacancy?.TestLocations?.Select(tl => tl.MasterTestLocation?.Name).FirstOrDefault(name => name != null) ?? c.CurrentLocation ?? "Test Center";

                items.Add(new CandidateSummaryDto(
                    c.Id, c.CandidateCode, c.FirstName, c.LastName, c.Email, c.Phone,
                    c.VacancyId, c.Vacancy?.Title ?? "Position", c.CurrentStage ?? "Screening", effectiveStatus, c.CreatedAt,
                    assignedInterviewer, hiringLocation, testLocation, c.PipelineProgressHistory.Count > 0));
            }

            return new CandidateListResultDto(items, totalCount);
        }
    }
}
