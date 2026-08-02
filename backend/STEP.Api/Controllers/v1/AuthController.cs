using System.Threading.Tasks;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Models;
using STEP.Domain.Entities.Staff;
using STEP.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace STEP.Api.Controllers.v1
{
    public class AuthController : BaseApiController
    {
        private readonly StepDbContext _db;
        private readonly IJwtProvider _jwtProvider;

        public AuthController(StepDbContext db, IJwtProvider jwtProvider)
        {
            _db = db;
            _jwtProvider = jwtProvider;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _db.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(ApiResponse<object>.Fail("Invalid credentials", statusCode: 401));
            }

            if (!user.IsActive)
            {
                return BadRequest(ApiResponse<object>.Fail("User account is inactive. Please contact HR Administrator."));
            }

            var roles = new[] { "HR", "Director", "Administrator" };
            var permissions = new[] { "Vacancy.View", "Vacancy.Create", "Candidate.View", "Candidate.Approve", "Exam.Manage", "Report.View" };

            var (accessToken, refreshToken) = _jwtProvider.GenerateTokens(user, roles, permissions);

            return Ok(ApiResponse<object>.Ok(new
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = new
                {
                    user.Id,
                    user.EmployeeCode,
                    user.FirstName,
                    user.LastName,
                    user.Email
                }
            }, "Authentication successful"));
        }

        [HttpPost("director-pin-login")]
        public async Task<IActionResult> DirectorPinLogin([FromBody] DirectorPinRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.UserId);
            if (user == null || string.IsNullOrEmpty(user.PinHash) || !BCrypt.Net.BCrypt.Verify(request.Pin, user.PinHash))
            {
                return Unauthorized(ApiResponse<object>.Fail("Invalid Director Authorization PIN", statusCode: 401));
            }

            return Ok(ApiResponse<object>.Ok(new { Verified = true, SessionToken = System.Guid.NewGuid().ToString("N") }, "Director PIN verified successfully"));
        }
    }

    public record LoginRequest(string Email, string Password);
    public record DirectorPinRequest(int UserId, string Pin);
}
