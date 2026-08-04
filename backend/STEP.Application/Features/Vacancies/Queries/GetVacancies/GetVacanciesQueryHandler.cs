using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Vacancies.Common;

namespace STEP.Application.Features.Vacancies.Queries.GetVacancies
{
    public class GetVacanciesQueryHandler(IApplicationDbContext db) : IRequestHandler<GetVacanciesQuery, VacancyListResultDto>
    {
        public async Task<VacancyListResultDto> Handle(GetVacanciesQuery request, CancellationToken cancellationToken)
        {
            var query = db.Vacancies
                .Include(v => v.Department)
                .Include(v => v.HiringLocation)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var term = request.Search.Trim();
                query = query.Where(v => v.Title.Contains(term) || v.VacancyCode.Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                query = query.Where(v => v.Status == request.Status);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var pageIndex = request.PageIndex < 1 ? 1 : request.PageIndex;
            var pageSize = request.PageSize is < 1 or > 200 ? 20 : request.PageSize;

            var items = await query
                .OrderByDescending(v => v.Id)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new VacancySummaryDto(
                    v.Id, v.VacancyCode, v.Title, v.Department.Name, v.HiringLocation.Name,
                    v.DriveType, v.Status, v.TotalOpenings, v.ClosingDate))
                .ToListAsync(cancellationToken);

            return new VacancyListResultDto(items, totalCount);
        }
    }
}
