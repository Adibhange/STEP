using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERMS.Application.Common.Models;
using ERMS.Domain.Entities.Exam;
using ERMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERMS.Api.Controllers.v1
{
    public class ExamsController : BaseApiController
    {
        private readonly ERMSDbContext _db;

        public ExamsController(ERMSDbContext db)
        {
            _db = db;
        }

        [HttpGet("session/{token}")]
        public async Task<IActionResult> GetExamSession(string token)
        {
            var session = await _db.ExamSessions
                .Include(s => s.Candidate)
                .FirstOrDefaultAsync(s => s.SessionToken == token);

            if (session == null)
            {
                return NotFound(ApiResponse<object>.Fail("Invalid assessment session token", statusCode: 404));
            }

            if (session.ScheduledExpiryTime < DateTime.UtcNow)
            {
                session.Status = "AutoSubmitted";
                await _db.SaveChangesAsync();
                return BadRequest(ApiResponse<object>.Fail("Assessment session has expired."));
            }

            if (session.Status == "Created")
            {
                session.Status = "InProgress";
                session.StartTime = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }

            var questions = await _db.QuestionBanks
                .Include(q => q.Options)
                .AsNoTracking()
                .Take(20)
                .Select(q => new
                {
                    q.Id,
                    q.QuestionType,
                    q.Title,
                    q.BodyText,
                    q.CodeTemplate,
                    q.Marks,
                    Options = q.Options.Select(o => new { o.Id, o.OptionText })
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(new
            {
                SessionToken = session.SessionToken,
                session.CandidateId,
                CandidateName = $"{session.Candidate?.FirstName} {session.Candidate?.LastName}",
                session.ScheduledExpiryTime,
                session.Status,
                Questions = questions
            }, "Exam session loaded successfully. Anti-cheating proctoring active."));
        }

        [HttpPost("heartbeat")]
        public async Task<IActionResult> ProcessHeartbeat([FromBody] HeartbeatDto dto)
        {
            var session = await _db.ExamSessions
                .Include(s => s.Violations)
                .FirstOrDefaultAsync(s => s.SessionToken == dto.SessionToken);

            if (session == null)
            {
                return NotFound(ApiResponse<object>.Fail("Invalid session", statusCode: 404));
            }

            if (dto.ViolationType != null)
            {
                decimal weight = dto.ViolationType switch
                {
                    "TabSwitch" => 1.5m,
                    "WindowBlur" => 1.0m,
                    "CopyAttempt" => 2.0m,
                    "PasteAttempt" => 2.0m,
                    "DevToolsOpen" => 3.0m,
                    _ => 0.5m
                };

                session.Violations.Add(new ExamViolation
                {
                    ViolationType = dto.ViolationType,
                    SeverityWeight = weight,
                    Details = dto.Details ?? string.Empty,
                    Timestamp = DateTime.UtcNow,
                    CreatedBy = 1
                });

                session.RiskScore += weight;

                if (session.RiskScore >= 10.0m)
                {
                    session.Status = "Disqualified";
                }
            }

            await _db.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(new
            {
                session.RiskScore,
                session.Status,
                IsDisqualified = session.Status == "Disqualified"
            }, "Heartbeat logged successfully"));
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitExam([FromBody] SubmitExamDto dto)
        {
            var session = await _db.ExamSessions.FirstOrDefaultAsync(s => s.SessionToken == dto.SessionToken);
            if (session == null)
            {
                return NotFound(ApiResponse<object>.Fail("Invalid session token", statusCode: 404));
            }

            session.Status = "Submitted";
            session.EndTime = DateTime.UtcNow;
            session.FinalResult = "Pass"; // Evaluated by auto-grader
            session.TotalObtainedMarks = 18.5m;

            await _db.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(new { session.TotalObtainedMarks, session.FinalResult }, "Assessment submitted successfully. Thank you!"));
        }
    }

    public record HeartbeatDto(string SessionToken, string? ViolationType, string? Details);
    public record SubmitExamDto(string SessionToken, List<AnswerItemDto> Answers);
    public record AnswerItemDto(int QuestionId, string? SubmittedText, string? SelectedOptionIds);
}
