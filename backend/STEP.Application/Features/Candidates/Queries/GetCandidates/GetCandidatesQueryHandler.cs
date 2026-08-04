using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;

namespace STEP.Application.Features.Candidates.Queries.GetCandidates
{
    public class GetCandidatesQueryHandler(IApplicationDbContext db) : IRequestHandler<GetCandidatesQuery, CandidateListResultDto>
    {
        public async Task<CandidateListResultDto> Handle(GetCandidatesQuery request, CancellationToken cancellationToken)
        {
            var query = db.Candidates.Include(c => c.Vacancy).AsNoTracking().AsQueryable();

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

            var items = await query
                .OrderByDescending(c => c.Id)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new CandidateSummaryDto(
                    c.Id, c.CandidateCode, c.FirstName, c.LastName, c.Email, c.Phone,
                    c.Vacancy.Title, c.CurrentStage, c.Status, c.CreatedAt))
                .ToListAsync(cancellationToken);

            return new CandidateListResultDto(items, totalCount);
        }
    }
}
