using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.QuestionPapers.Common;
using STEP.Domain.Entities.Vacancy;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;

namespace STEP.Application.Features.QuestionPapers.Commands.CreateQuestionPaper
{
    public class CreateQuestionPaperCommandHandler(IApplicationDbContext db) : IRequestHandler<CreateQuestionPaperCommand, QuestionPaperDto>
    {
        public async Task<QuestionPaperDto> Handle(CreateQuestionPaperCommand request, CancellationToken cancellationToken)
        {
            var vacancy = await db.Vacancies
                .Include(v => v.AssessmentSections)
                .FirstOrDefaultAsync(v => v.Id == request.VacancyId, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyEntity), request.VacancyId);

            var nextSequence = await db.VacancyQuestionPapers.IgnoreQueryFilters().CountAsync(cancellationToken) + 1;
            var paperCode = $"QP-{vacancy.VacancyCode}-{nextSequence}";

            var paper = new VacancyQuestionPaper
            {
                VacancyId = request.VacancyId,
                PaperCode = paperCode,
                Title = request.Title.Trim(),
                PaperVersion = 1,
                TotalQuestions = vacancy.AssessmentSections.Sum(s => s.TotalQuestions),
                TotalMarks = vacancy.AssessmentSections.Sum(s => s.TotalMarks),
                DurationMinutes = request.DurationMinutes,
                PassingPercentage = request.PassingPercentage,
                Status = "Draft",
            };

            db.VacancyQuestionPapers.Add(paper);
            await db.SaveChangesAsync(cancellationToken);

            return new QuestionPaperDto(paper.Id, paper.VacancyId, paper.PaperCode, paper.Title, paper.PaperVersion,
                paper.TotalQuestions, paper.TotalMarks, paper.DurationMinutes, paper.PassingPercentage, paper.Status,
                paper.PublishedAt, []);
        }
    }
}
