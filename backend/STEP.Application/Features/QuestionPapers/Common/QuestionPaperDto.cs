using System;
using System.Collections.Generic;

namespace STEP.Application.Features.QuestionPapers.Common
{
    public record QuestionOptionDto(int Id, string OptionLabel, string OptionText, bool IsCorrect);

    public record QuestionDto(
        int Id,
        int QuestionNumber,
        string QuestionType,
        string QuestionText,
        decimal Marks,
        string? ProgrammingLanguage,
        string? SqlSchema,
        int? MaxWordCount,
        List<QuestionOptionDto> Options);

    public record QuestionPaperDto(
        int Id,
        int VacancyId,
        string PaperCode,
        string Title,
        int PaperVersion,
        int TotalQuestions,
        decimal TotalMarks,
        int DurationMinutes,
        decimal PassingPercentage,
        string Status,
        DateTime? PublishedAt,
        List<QuestionDto> Questions);

    public record QuestionImportResultDto(int TotalQuestionsImported, int WorksheetsSkipped, List<string> SkippedWorksheetNames, List<string> Warnings);
}
