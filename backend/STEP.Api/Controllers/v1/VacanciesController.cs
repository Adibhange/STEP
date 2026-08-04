using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.Vacancies.Commands.AssignQuestionPaperToRound;
using STEP.Application.Features.Vacancies.Commands.CreateVacancy;
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

        [HttpPost("pipeline-rounds/{roundId:int}/question-paper")]
        [Authorize(Policy = "Exam.Manage")]
        public async Task<IActionResult> AssignQuestionPaperToRound(int roundId, [FromBody] AssignQuestionPaperRequestBody body)
        {
            await mediator.Send(new AssignQuestionPaperToRoundCommand(roundId, body.VacancyQuestionPaperId));
            return Ok(ApiResponse<object>.Ok(new { }, "Question paper linked to pipeline round"));
        }
    }

    public record AssignQuestionPaperRequestBody(int VacancyQuestionPaperId);
}
