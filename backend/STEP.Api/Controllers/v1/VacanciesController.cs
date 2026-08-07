using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.Vacancies.Commands.AssignQuestionPaperToRound;
using STEP.Application.Features.Vacancies.Commands.CreateVacancy;
using STEP.Application.Features.Vacancies.Commands.CreateVacancyPipelineFlow;
using STEP.Application.Features.Vacancies.Commands.DeleteVacancyPipelineFlow;
using STEP.Application.Features.Vacancies.Queries.GetVacancies;
using STEP.Application.Features.Vacancies.Queries.GetVacancyById;

namespace STEP.Api.Controllers.v1
{
    [Authorize]
    public class VacanciesController(ISender mediator) : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetVacancies(
            [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null, [FromQuery] string? status = null)
        {
            var result = await mediator.Send(new GetVacanciesQuery(pageIndex, pageSize, search, status));
            var meta = new PaginationMeta { PageIndex = pageIndex, PageSize = pageSize, TotalCount = result.TotalCount };
            return Ok(ApiResponse<object>.Ok(result.Items, "Vacancies retrieved successfully", meta));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetVacancyById(int id)
        {
            var vacancy = await mediator.Send(new GetVacancyByIdQuery(id));
            return Ok(ApiResponse<object>.Ok(vacancy, "Vacancy retrieved successfully"));
        }

        [HttpPost]
        [Authorize(Policy = "Vacancy.Create")]
        public async Task<IActionResult> CreateVacancy([FromBody] CreateVacancyCommand command)
        {
            var vacancy = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(vacancy, "Vacancy created successfully"));
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = "Vacancy.Create")]
        public async Task<IActionResult> UpdateVacancy(int id, [FromBody] UpdateVacancyRequestBody body)
        {
            var vacancy = await mediator.Send(new STEP.Application.Features.Vacancies.Commands.UpdateVacancy.UpdateVacancyCommand(
                id, body.Title, body.Status, body.JobDescription, body.MinExperienceYears, body.MaxExperienceYears));
            return Ok(ApiResponse<object>.Ok(vacancy, "Vacancy updated successfully"));
        }

        [HttpPost("{vacancyId:int}/pipeline-flows")]
        [Authorize(Policy = "Vacancy.Create")]
        public async Task<IActionResult> CreatePipelineFlow(int vacancyId, [FromBody] CreatePipelineFlowRequestBody body)
        {
            var flow = await mediator.Send(new CreateVacancyPipelineFlowCommand(
                vacancyId, body.VersionName, body.Description, body.IsDefault, body.Rounds));
            return Ok(ApiResponse<object>.Ok(flow, "Pipeline flow created successfully"));
        }

        [HttpPut("{vacancyId:int}/pipeline-flows/{flowId:int}")]
        [Authorize(Policy = "Vacancy.Create")]
        public async Task<IActionResult> UpdatePipelineFlow(int vacancyId, int flowId, [FromBody] UpdatePipelineFlowRequestBody body)
        {
            var flow = await mediator.Send(new STEP.Application.Features.Vacancies.Commands.UpdateVacancyPipelineFlow.UpdateVacancyPipelineFlowCommand(
                vacancyId, flowId, body.VersionName, body.Description, body.IsDefault, body.Rounds));
            return Ok(ApiResponse<object>.Ok(flow, "Pipeline flow updated successfully"));
        }

        [HttpDelete("{vacancyId:int}/pipeline-flows/{flowId:int}")]
        [Authorize(Policy = "Vacancy.Create")]
        public async Task<IActionResult> DeletePipelineFlow(int vacancyId, int flowId)
        {
            await mediator.Send(new DeleteVacancyPipelineFlowCommand(vacancyId, flowId));
            return Ok(ApiResponse<object>.Ok(new { vacancyId, flowId }, "Pipeline flow deleted successfully"));
        }

        [HttpPost("pipeline-rounds/{roundId:int}/question-paper")]
        [Authorize(Policy = "Exam.Manage")]
        public async Task<IActionResult> AssignQuestionPaperToRound(int roundId, [FromBody] AssignQuestionPaperRequestBody body)
        {
            await mediator.Send(new AssignQuestionPaperToRoundCommand(roundId, body.VacancyQuestionPaperId));
            return Ok(ApiResponse<object>.Ok(new { }, "Question paper linked to pipeline round"));
        }
    }

    public record AssignQuestionPaperRequestBody(int VacancyQuestionPaperId);
    public record UpdateVacancyRequestBody(
        string Title, string Status, string? JobDescription,
        decimal MinExperienceYears, decimal MaxExperienceYears);
    public record UpdatePipelineFlowRequestBody(
        string VersionName, string? Description, bool IsDefault,
        List<STEP.Application.Features.Vacancies.Commands.UpdateVacancyPipelineFlow.UpdateRoundInput> Rounds);
    public record CreatePipelineFlowRequestBody(
        string VersionName, string? Description, bool IsDefault,
        List<STEP.Application.Features.Vacancies.Commands.CreateVacancyPipelineFlow.CreateRoundInput> Rounds);
}
