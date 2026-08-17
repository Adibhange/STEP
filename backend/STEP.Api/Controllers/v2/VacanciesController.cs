using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.V2.Vacancies.Commands.CreateInstantDrive;
using STEP.Application.Features.V2.Vacancies.Commands.CreateRoleHiringProfile;
using STEP.Application.Features.V2.Vacancies.Commands.UpdateRoleHiringProfile;
using STEP.Application.Features.V2.Vacancies.Queries.GetRoleHiringProfiles;

namespace STEP.Api.Controllers.v2
{
    [Authorize]
    public class VacanciesController(ISender mediator) : BaseApiControllerV2
    {
        /// <summary>
        /// Retrieves active hiring profile templates (e.g. Fresher, 1-2 Years, 2-4 Years) for a MasterRole.
        /// Used by the 2-step Instant Drive modal to dynamically populate profile options.
        /// </summary>
        [HttpGet("roles/{roleId:int}/profiles")]
        public async Task<IActionResult> GetProfilesForRole(int roleId)
        {
            var profiles = await mediator.Send(new GetRoleHiringProfilesQuery(roleId));
            return Ok(ApiResponse<object>.Ok(profiles, "Hiring profile templates retrieved successfully"));
        }

        /// <summary>
        /// Creates a new hiring profile blueprint with relational section rules.
        /// Primary key Id is generated via SQL Server IDENTITY(1,1).
        /// </summary>
        [HttpPost("roles/{roleId:int}/profiles")]
        [Authorize(Policy = "Vacancy.Create")]
        public async Task<IActionResult> CreateProfile(int roleId, [FromBody] CreateRoleHiringProfileCommand command)
        {
            var profile = await mediator.Send(command with { MasterRoleId = roleId });
            return Ok(ApiResponse<object>.Ok(profile, "Hiring profile created successfully"));
        }

        /// <summary>
        /// Updates an existing hiring profile blueprint and refreshes its section rules.
        /// </summary>
        [HttpPut("profiles/{profileId:int}")]
        [Authorize(Policy = "Vacancy.Update")]
        public async Task<IActionResult> UpdateProfile(int profileId, [FromBody] UpdateRoleHiringProfileCommand command)
        {
            var profile = await mediator.Send(command with { ProfileId = profileId });
            return Ok(ApiResponse<object>.Ok(profile, "Hiring profile updated successfully"));
        }

        /// <summary>
        /// 1-Click Recruitment Engine Drive Launch: Creates a vacancy, validates the question pool,
        /// builds the pipeline flow, and activates the live QR code in under 1 second.
        /// </summary>
        [HttpPost("instant-drive")]
        [Authorize(Policy = "Vacancy.Create")]
        public async Task<IActionResult> CreateInstantDrive([FromBody] CreateInstantDriveCommand command)
        {
            var driveResult = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(driveResult, "⚡ Autonomous recruitment drive launched successfully"));
        }
    }
}
