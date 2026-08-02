using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using STEP.Application.Common.Models;
using STEP.Domain.Entities.Candidate;
using STEP.Domain.Entities.Exam;
using STEP.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace STEP.Api.Controllers.v1
{
    public class CandidatesController : BaseApiController
    {
        private readonly StepDbContext _db;

        public CandidatesController(StepDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetCandidates([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null, [FromQuery] string? status = null)
        {
            var query = _db.Candidates
                .Include(c => c.Vacancy)
                .Include(c => c.Location)
                .Include(c => c.EducationHistory)
                .Include(c => c.WorkHistory)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c => c.FirstName.Contains(search) || c.LastName.Contains(search) || c.Email.Contains(search) || c.Mobile.Contains(search) || c.CandidateCode.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(c => c.Status == status);
            }

            var totalCount = await query.CountAsync();
            var items = await query.OrderByDescending(c => c.Id)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var meta = new PaginationMeta { PageIndex = pageIndex, PageSize = pageSize, TotalCount = totalCount };
            return Ok(ApiResponse<List<Candidate>>.Ok(items, "Candidates retrieved successfully", meta));
        }

        [HttpPost("walkin")]
        public async Task<IActionResult> RegisterWalkIn([FromBody] RegisterCandidateDto dto)
        {
            var candidate = new Candidate
            {
                CandidateCode = "CND-" + DateTime.UtcNow.Ticks.ToString()[^6..],
                VacancyId = dto.VacancyId,
                SourceType = dto.SourceType,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Mobile = dto.Mobile,
                DOB = dto.DOB,
                Gender = dto.Gender,
                Address = dto.Address,
                LocationId = dto.LocationId,
                CurrentSalary = dto.CurrentSalary,
                ExpectedSalary = dto.ExpectedSalary,
                NoticePeriodDays = dto.NoticePeriodDays,
                OverallExperienceMonths = dto.OverallExperienceMonths,
                Status = "PendingVerification",
                CreatedBy = 1
            };

            _db.Candidates.Add(candidate);
            await _db.SaveChangesAsync();

            return Ok(ApiResponse<Candidate>.Ok(candidate, "Walk-in registration submitted successfully. Pending HR verification."));
        }

        [HttpPost("{id}/verify")]
        public async Task<IActionResult> VerifyCandidate(int id)
        {
            var candidate = await _db.Candidates.FirstOrDefaultAsync(c => c.Id == id);
            if (candidate == null)
            {
                return NotFound(ApiResponse<object>.Fail("Candidate not found", statusCode: 404));
            }

            candidate.Status = "Verified";
            candidate.ModifiedBy = 1;
            candidate.ModifiedDate = DateTime.UtcNow;

            // Generate Exam Session for initial test stage
            var session = new ExamSession
            {
                SessionToken = Guid.NewGuid().ToString("N"),
                CandidateId = candidate.Id,
                ExamAssignmentId = 1, // Default initial assignment
                ScheduledExpiryTime = DateTime.UtcNow.AddHours(4),
                Status = "Created",
                CreatedBy = 1
            };

            _db.ExamSessions.Add(session);
            await _db.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(new
            {
                Candidate = candidate,
                ExamToken = session.SessionToken
            }, "Candidate verified and assessment session generated."));
        }
    }

    public record RegisterCandidateDto(
        int VacancyId,
        string SourceType,
        string FirstName,
        string LastName,
        string Email,
        string Mobile,
        DateTime DOB,
        string Gender,
        string Address,
        int LocationId,
        decimal? CurrentSalary,
        decimal? ExpectedSalary,
        int? NoticePeriodDays,
        int OverallExperienceMonths
    );
}
