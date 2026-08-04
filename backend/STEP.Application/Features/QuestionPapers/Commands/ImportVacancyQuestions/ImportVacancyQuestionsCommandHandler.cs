using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.QuestionPapers.Common;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Application.Features.QuestionPapers.Commands.ImportVacancyQuestions
{
    public class ImportVacancyQuestionsCommandHandler(IApplicationDbContext db, IExcelQuestionImportParser parser)
        : IRequestHandler<ImportVacancyQuestionsCommand, QuestionImportResultDto>
    {
        public async Task<QuestionImportResultDto> Handle(ImportVacancyQuestionsCommand request, CancellationToken cancellationToken)
        {
            var paper = await db.VacancyQuestionPapers
                .Include(p => p.Vacancy).ThenInclude(v => v.AssessmentSections)
                .Include(p => p.Questions)
                .FirstOrDefaultAsync(p => p.Id == request.VacancyQuestionPaperId, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyQuestionPaper), request.VacancyQuestionPaperId);

            if (paper.Status != "Draft")
            {
                throw new ValidationException([
                    new FluentValidation.Results.ValidationFailure(nameof(paper.Status),
                        $"Cannot import questions into a paper with status '{paper.Status}'. Only Draft papers are editable.")
                ]);
            }

            var parsed = parser.Parse(request.FileStream);
            var sectionsByOrder = paper.Vacancy.AssessmentSections.ToDictionary(s => s.SectionOrder, s => s);

            var nextQuestionNumber = paper.Questions.Count + 1;
            var unmatchedSectionRowCount = 0;

            foreach (var row in parsed.Rows)
            {
                if (row.SectionOrder is not int order || !sectionsByOrder.TryGetValue(order, out var section))
                {
                    unmatchedSectionRowCount++;
                    continue;
                }

                var question = new VacancyQuestion
                {
                    VacancyQuestionPaperId = paper.Id,
                    VacancyAssessmentSectionId = section.Id,
                    QuestionNumber = nextQuestionNumber++,
                    Version = 1,
                    QuestionType = row.QuestionType,
                    QuestionText = row.QuestionText,
                    Marks = section.MarksPerQuestion,
                    ProgrammingLanguage = row.ProgrammingLanguage,
                    SqlSchema = row.SqlSchema,
                    MaxWordCount = row.MaxWordCount,
                };

                foreach (var opt in row.Options)
                {
                    question.Options.Add(new VacancyQuestionOption
                    {
                        OptionLabel = opt.Label,
                        OptionText = opt.Text,
                        IsCorrect = opt.IsCorrect,
                    });
                }

                paper.Questions.Add(question);
            }

            paper.TotalQuestions = paper.Questions.Count;
            paper.TotalMarks = paper.Questions.Sum(q => q.Marks);

            await db.SaveChangesAsync(cancellationToken);

            var skipped = parsed.SkippedWorksheetNames.ToList();
            if (unmatchedSectionRowCount > 0)
            {
                skipped.Add($"{unmatchedSectionRowCount} row(s) referenced a section not defined on this vacancy");
            }

            return new QuestionImportResultDto(paper.Questions.Count, skipped.Count, skipped);
        }
    }
}
