using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERMS.Application.Common.Models;
using ERMS.Domain.Entities.Vacancy;
using ERMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERMS.Api.Controllers.v1
{
    public class VacanciesController : BaseApiController
    {
        private readonly ERMSDbContext _db;

        public VacanciesController(ERMSDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetVacancies([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
        {
            var query = _db.Vacancies
                .Include(v => v.Location)
                .Include(v => v.VacancyStages)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(v => v.Title.Contains(search) || v.VacancyCode.Contains(search) || v.Department.Contains(search));
            }

            var totalCount = await query.CountAsync();
            var items = await query.OrderByDescending(v => v.Id)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var meta = new PaginationMeta { PageIndex = pageIndex, PageSize = pageSize, TotalCount = totalCount };
            return Ok(ApiResponse<List<Vacancy>>.Ok(items, "Vacancies retrieved successfully", meta));
        }

        [HttpPost]
        public async Task<IActionResult> CreateVacancy([FromBody] CreateVacancyDto dto)
        {
            var vacancy = new Vacancy
            {
                VacancyCode = "VAC-" + System.DateTime.UtcNow.Ticks.ToString()[^6..],
                Title = dto.Title,
                Department = dto.Department,
                LocationId = dto.LocationId,
                MinExperienceYears = dto.MinExperienceYears,
                MaxExperienceYears = dto.MaxExperienceYears,
                OpeningsCount = dto.OpeningsCount,
                Status = "Published",
                TargetClosureDate = dto.TargetClosureDate,
                CreatedBy = 1
            };

            int order = 1;
            foreach (var stage in dto.Stages)
            {
                vacancy.VacancyStages.Add(new VacancyStage
                {
                    StageOrder = order++,
                    StageName = stage.StageName,
                    StageType = stage.StageType,
                    PassMarkPercentage = stage.PassMarkPercentage,
                    IsMandatory = stage.IsMandatory,
                    CreatedBy = 1
                });
            }

            _db.Vacancies.Add(vacancy);
            await _db.SaveChangesAsync();

            return Ok(ApiResponse<Vacancy>.Ok(vacancy, "Job Vacancy created with dynamic pipeline stages"));
        }
    }

    public record CreateVacancyDto(
        string Title,
        string Department,
        int LocationId,
        decimal MinExperienceYears,
        decimal MaxExperienceYears,
        int OpeningsCount,
        System.DateTime TargetClosureDate,
        List<VacancyStageDto> Stages
    );

    public record VacancyStageDto(string StageName, string StageType, decimal? PassMarkPercentage, bool IsMandatory);
}
