using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.QuestionPapers.Common;

namespace STEP.Application.Features.QuestionPapers.Queries.GetQuestionPapers
{
    public class GetQuestionPapersQueryHandler(IApplicationDbContext db) : IRequestHandler<GetQuestionPapersQuery, List<QuestionPaperDto>>
    {
        public async Task<List<QuestionPaperDto>> Handle(GetQuestionPapersQuery request, CancellationToken cancellationToken)
        {
            var papers = await db.VacancyQuestionPapers
                .Include(p => p.Questions).ThenInclude(q => q.Options)
                .AsSplitQuery()
                .AsNoTracking()
                .OrderByDescending(p => p.Id)
                .ToListAsync(cancellationToken);

            return papers.Select(paper => new QuestionPaperDto(
                paper.Id,
                paper.VacancyId,
                paper.PaperCode,
                paper.Title,
                paper.PaperVersion,
                paper.TotalQuestions,
                paper.TotalMarks,
                paper.DurationMinutes,
                paper.PassingPercentage,
                paper.Status,
                paper.PublishedAt,
                paper.Questions.OrderBy(q => q.QuestionNumber).Select(q => new QuestionDto(
                    q.Id, q.QuestionNumber, q.QuestionType, q.QuestionText, q.Marks,
                    q.ProgrammingLanguage, q.SqlSchema, q.MaxWordCount,
                    q.Options.Select(o => new QuestionOptionDto(o.Id, o.OptionLabel, o.OptionText, o.IsCorrect)).ToList()
                )).ToList()
            )).ToList();
        }
    }
}
