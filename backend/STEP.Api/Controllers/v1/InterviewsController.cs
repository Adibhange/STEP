using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using STEP.Application.Common.Models;
using STEP.Domain.Entities.Interview;
using STEP.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace STEP.Api.Controllers.v1
{
    public class InterviewsController : BaseApiController
    {
        private readonly StepDbContext _db;

        public InterviewsController(StepDbContext db)
        {
            _db = db;
        }

        [HttpGet("schedules")]
        public async Task<IActionResult> GetSchedules()
        {
            var schedules = await _db.InterviewSchedules
                .Include(s => s.Progress)
                .ThenInclude(p => p!.Candidate)
                .Include(s => s.Progress)
                .ThenInclude(p => p!.VacancyStage)
                .Include(s => s.InterviewerUser)
                .AsNoTracking()
                .ToListAsync();

            return Ok(ApiResponse<List<InterviewSchedule>>.Ok(schedules, "Scheduled interviews retrieved successfully"));
        }

        [HttpPost("feedback")]
        public async Task<IActionResult> SubmitFeedback([FromBody] SubmitFeedbackDto dto)
        {
            var schedule = await _db.InterviewSchedules.FirstOrDefaultAsync(s => s.Id == dto.ScheduleId);
            if (schedule == null)
            {
                return NotFound(ApiResponse<object>.Fail("Interview schedule not found", statusCode: 404));
            }

            var feedback = new InterviewFeedback
            {
                ScheduleId = dto.ScheduleId,
                TechnicalRating = dto.TechnicalRating,
                CommunicationRating = dto.CommunicationRating,
                ProblemSolvingRating = dto.ProblemSolvingRating,
                CulturalFitRating = dto.CulturalFitRating,
                Strengths = dto.Strengths,
                Weaknesses = dto.Weaknesses,
                Recommendation = dto.Recommendation,
                Comments = dto.Comments,
                CreatedBy = 1
            };

            _db.InterviewFeedbacks.Add(feedback);
            await _db.SaveChangesAsync();

            return Ok(ApiResponse<InterviewFeedback>.Ok(feedback, "Interview scorecard submitted successfully"));
        }
    }

    public record SubmitFeedbackDto(
        int ScheduleId,
        int TechnicalRating,
        int CommunicationRating,
        int ProblemSolvingRating,
        int CulturalFitRating,
        string Strengths,
        string Weaknesses,
        string Recommendation,
        string Comments
    );
}
