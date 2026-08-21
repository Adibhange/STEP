using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STEP.Application.Common.Models;
using STEP.Application.Features.V2.QuestionBank;

namespace STEP.Api.Controllers
{
    [Route("api/v2/question-bank")]
    [Route("api/v1/question-bank")]
    [Route("api/question-bank")]
    [Authorize]
    public class QuestionBankController(ISender mediator) : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> SearchQuestions(
            [FromQuery] string? language,
            [FromQuery] string? sectionType,
            [FromQuery] string? questionType,
            [FromQuery] string? experienceTier,
            [FromQuery] bool? isActive,
            [FromQuery] string? search,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 1000)
        {
            var result = await mediator.Send(new SearchMasterQuestionsQuery(
                language,
                sectionType,
                questionType,
                experienceTier,
                isActive,
                search,
                pageIndex,
                pageSize
            ));
            return Ok(ApiResponse<object>.Ok(result.Items, "Questions retrieved successfully"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateQuestion([FromBody] CreateMasterQuestionCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(result, "Question created successfully"));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateQuestion(int id, [FromBody] UpdateMasterQuestionCommand command)
        {
            var updated = command with { Id = id };
            var result = await mediator.Send(updated);
            return Ok(ApiResponse<object>.Ok(result, "Question updated successfully"));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var result = await mediator.Send(new DeleteMasterQuestionCommand(id));
            return Ok(ApiResponse<object>.Ok(result, "Question deleted successfully"));
        }

        [HttpPost("bulk-delete")]
        public async Task<IActionResult> BulkDelete([FromBody] BulkDeleteQuestionsCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(result, "Bulk questions deleted successfully"));
        }

        [HttpPost("bulk-status")]
        public async Task<IActionResult> BulkStatus([FromBody] BulkToggleQuestionStatusCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(result, "Question statuses toggled successfully"));
        }

        [HttpPost("bulk-import")]
        public async Task<IActionResult> BulkImport([FromBody] BulkImportQuestionsCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(result, "Questions imported successfully"));
        }

        [HttpGet("excel-template")]
        public IActionResult GetExcelTemplate()
        {
            var csv = "Language,SectionType,QuestionType,ExperienceTier,QuestionText,Marks,OptionA,OptionB,OptionC,OptionD,CorrectOption\n"
                    + "C# (.NET),TechnicalMCQ,SINGLE_CHOICE,Fresher,\"What is the default value of a boolean in C#?\",1.00,\"false\",\"true\",\"null\",\"0\",\"A\"\n"
                    + "SQL,SQLQuery,SQL,Junior,\"Write a query to find all employees with salary > 50000\",5.00,\"\",\"\",\"\",\"\",\"\"\n";

            var bytes = Encoding.UTF8.GetBytes(csv);
            return File(bytes, "text/csv", "QuestionBank_Import_Template.csv");
        }
    }
}

