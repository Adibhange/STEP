using System.Collections.Generic;
using System.Linq;
using FluentValidation.Results;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Application.Features.QuestionPapers.Common
{
    /// <summary>
    /// Shared publish-readiness checklist for a VacancyQuestionPaper: question count vs. the
    /// vacancy's assessment pattern, total marks vs. pattern, every MCQ has a correct option
    /// marked, and non-empty question text for CODING/SQL/SUBJECTIVE questions.
    ///
    /// Used two ways:
    ///  - PublishQuestionPaperCommandHandler: a hard gate — any failure blocks publishing.
    ///  - ImportVacancyQuestionsCommandHandler: an informational, non-blocking pass — failures are
    ///    surfaced as import Warnings so problems are visible right after import instead of only
    ///    at publish time (a partial import mid-pattern is expected and not itself an error here).
    ///
    /// Requires paper.Vacancy.AssessmentSections, paper.Questions, and paper.Questions[].Options
    /// to already be loaded (.Include'd) by the caller.
    /// </summary>
    public static class QuestionPaperValidation
    {
        public static List<ValidationFailure> Validate(VacancyQuestionPaper paper)
        {
            var failures = new List<ValidationFailure>();

            // 1. Total questions must match the vacancy's assessment section pattern.
            var expectedQuestionCount = paper.Vacancy.AssessmentSections.Sum(s => s.TotalQuestions);
            if (paper.Questions.Count != expectedQuestionCount)
            {
                failures.Add(new ValidationFailure(nameof(paper.TotalQuestions),
                    $"Paper has {paper.Questions.Count} question(s) but the assessment pattern requires {expectedQuestionCount}."));
            }

            // 2. Total marks must match the section pattern's total marks.
            var expectedMarks = paper.Vacancy.AssessmentSections.Sum(s => s.TotalMarks);
            var actualMarks = paper.Questions.Sum(q => q.Marks);
            if (actualMarks != expectedMarks)
            {
                failures.Add(new ValidationFailure(nameof(paper.TotalMarks),
                    $"Paper totals {actualMarks} marks but the assessment pattern requires {expectedMarks}."));
            }

            // 3. Every MCQ question must have at least one correct option.
            foreach (var q in paper.Questions.Where(q => q.QuestionType is "SINGLE_CHOICE" or "MULTI_CHOICE"))
            {
                if (!q.Options.Any(o => o.IsCorrect))
                {
                    failures.Add(new ValidationFailure(nameof(VacancyQuestion.Options),
                        $"Question #{q.QuestionNumber} ({q.QuestionType}) has no option marked correct."));
                }
            }

            // 4. Coding/SQL/Subjective questions must have non-empty question text.
            foreach (var q in paper.Questions.Where(q => q.QuestionType is "CODING" or "SQL" or "SUBJECTIVE"))
            {
                if (string.IsNullOrWhiteSpace(q.QuestionText))
                {
                    failures.Add(new ValidationFailure(nameof(VacancyQuestion.QuestionText),
                        $"Question #{q.QuestionNumber} ({q.QuestionType}) has empty question text."));
                }
            }

            return failures;
        }
    }
}
