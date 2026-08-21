using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.QuestionPapers.Commands.CreateQuestionPaper;
using STEP.Application.Features.QuestionPapers.Commands.ImportVacancyQuestions;
using STEP.Application.Features.QuestionPapers.Commands.PublishQuestionPaper;
using STEP.Application.Features.QuestionPapers.Queries.GetQuestionPaperById;
using STEP.Application.Features.QuestionPapers.Queries.GetQuestionPapers;

namespace STEP.Api.Controllers
{
    [Authorize]
    public class QuestionPapersController(ISender mediator) : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var papers = await mediator.Send(new GetQuestionPapersQuery());
            return Ok(ApiResponse<object>.Ok(papers, "Question papers retrieved successfully"));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var paper = await mediator.Send(new GetQuestionPaperByIdQuery(id));
            return Ok(ApiResponse<object>.Ok(paper, "Question paper retrieved successfully"));
        }

        [HttpPost]
        [Authorize(Policy = "Vacancy.Create")]
        public async Task<IActionResult> Create([FromBody] CreateQuestionPaperCommand command)
        {
            var paper = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(paper, "Draft question paper created successfully"));
        }

        [HttpPost("{id:int}/import-excel")]
        [Authorize(Policy = "Exam.Manage")]
        [RequestSizeLimit(20_000_000)]
        public async Task<IActionResult> ImportExcel(int id, IFormFile file)
        {
            if (file is null || file.Length == 0)
            {
                return BadRequest(ApiResponse<object>.Fail("An .xlsx file is required."));
            }

            await using var stream = file.OpenReadStream();
            var result = await mediator.Send(new ImportVacancyQuestionsCommand(id, stream));
            return Ok(ApiResponse<object>.Ok(result, $"{result.TotalQuestionsImported} question(s) imported successfully"));
        }

        [HttpPost("{id:int}/publish")]
        [Authorize(Policy = "Exam.Manage")]
        public async Task<IActionResult> Publish(int id)
        {
            var publishedBy = CurrentUserId ?? throw new UnauthorizedAccessException("Unable to resolve the current user.");
            var paper = await mediator.Send(new PublishQuestionPaperCommand(id, publishedBy));
            return Ok(ApiResponse<object>.Ok(paper, "Question paper published and locked successfully"));
        }
    }
}

