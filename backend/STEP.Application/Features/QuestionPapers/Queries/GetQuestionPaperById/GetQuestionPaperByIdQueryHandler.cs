using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.QuestionPapers.Common;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Application.Features.QuestionPapers.Queries.GetQuestionPaperById
{
    public class GetQuestionPaperByIdQueryHandler(IApplicationDbContext db) : IRequestHandler<GetQuestionPaperByIdQuery, QuestionPaperDto>
    {
        public async Task<QuestionPaperDto> Handle(GetQuestionPaperByIdQuery request, CancellationToken cancellationToken)
        {
            var paper = await db.VacancyQuestionPapers
                .Include(p => p.Questions).ThenInclude(q => q.Options)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyQuestionPaper), request.Id);

            var questions = paper.Questions
                .OrderBy(q => q.QuestionNumber)
                .Select(q => new QuestionDto(
                    q.Id, q.QuestionNumber, q.QuestionType, q.QuestionText, q.Marks,
                    q.ProgrammingLanguage, q.SqlSchema, q.MaxWordCount,
                    q.Options.Select(o => new QuestionOptionDto(o.Id, o.OptionLabel, o.OptionText, o.IsCorrect)).ToList()))
                .ToList();

            return new QuestionPaperDto(paper.Id, paper.VacancyId, paper.PaperCode, paper.Title, paper.PaperVersion,
                paper.TotalQuestions, paper.TotalMarks, paper.DurationMinutes, paper.PassingPercentage, paper.Status,
                paper.PublishedAt, questions);
        }
    }
}
