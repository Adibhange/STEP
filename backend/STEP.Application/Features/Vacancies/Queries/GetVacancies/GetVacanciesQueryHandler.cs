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
                .Include(v => v.MasterRole)
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

            var rawItems = await query
                .OrderByDescending(v => v.Id)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new
                {
                    v.Id,
                    v.VacancyCode,
                    v.Title,
                    MasterRoleName = v.MasterRole != null ? v.MasterRole.Name : null,
                    DepartmentName = v.Department != null ? v.Department.Name : "Engineering",
                    HiringLocationName = v.HiringLocation != null ? v.HiringLocation.Name : "Main Office",
                    v.DriveType,
                    v.Status,
                    v.WorkMode,
                    v.TotalOpenings,
                    v.MinExperienceYears,
                    v.MaxExperienceYears,
                    v.ClosingDate,
                    v.WalkinDriveDate
                })
                .ToListAsync(cancellationToken);

            var items = rawItems.Select(v =>
            {
                string expText;
                if (v.MinExperienceYears == 0 && v.MaxExperienceYears <= 0)
                    expText = "Fresher (0 Years)";
                else if (v.MinExperienceYears == 0 && v.MaxExperienceYears <= 1)
                    expText = "Junior (0-1 Year)";
                else if (v.MaxExperienceYears >= 90)
                    expText = $"{v.MinExperienceYears}+ Years";
                else
                    expText = $"{v.MinExperienceYears}-{v.MaxExperienceYears} Years";

                var roleName = !string.IsNullOrWhiteSpace(v.MasterRoleName)
                    ? v.MasterRoleName
                    : (v.Title?.Contains(" - ") == true ? v.Title.Split(" - ")[0] : (v.Title ?? "Engineering"));

                return new VacancySummaryDto(
                    v.Id,
                    v.VacancyCode,
                    v.Title,
                    roleName,
                    v.DepartmentName,
                    v.HiringLocationName,
                    v.DriveType ?? "Walk-in Drive",
                    v.Status ?? "Active",
                    v.WorkMode ?? "On-site",
                    v.TotalOpenings,
                    v.MinExperienceYears,
                    v.MaxExperienceYears,
                    expText,
                    v.ClosingDate,
                    v.WalkinDriveDate
                );
            }).ToList();

            return new VacancyListResultDto(items, totalCount);
        }
    }
}
