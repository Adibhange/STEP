using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Models;

namespace STEP.Api.Controllers
{
    [AllowAnonymous]
    public class HealthController(IApplicationDbContext db) : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> CheckHealth()
        {
            var sw = Stopwatch.StartNew();
            bool dbConnected = false;
            string? dbError = null;

            try
            {
                // Verify SQL connectivity
                dbConnected = await db.Roles.AnyAsync();
                sw.Stop();
            }
            catch (Exception ex)
            {
                sw.Stop();
                dbError = ex.Message;
            }

            var healthReport = new
            {
                status = dbConnected ? "Healthy" : "Degraded",
                version = "2.4.0-enterprise",
                timestamp = DateTime.UtcNow,
                database = new
                {
                    connected = dbConnected,
                    latencyMs = sw.ElapsedMilliseconds,
                    error = dbError
                },
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
            };

            return Ok(ApiResponse<object>.Ok(healthReport, "Service health status"));
        }
    }
}
