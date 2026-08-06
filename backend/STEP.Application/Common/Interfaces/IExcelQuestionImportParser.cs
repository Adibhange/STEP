using System.Collections.Generic;
using System.IO;

namespace STEP.Application.Common.Interfaces
{
    public record ParsedOption(string Label, string Text, bool IsCorrect);

    public record ParsedQuestionRow(
        int? SectionOrder,
        string QuestionType,
        string QuestionText,
        string? ProgrammingLanguage,
        string? SqlSchema,
        int? MaxWordCount,
        List<ParsedOption> Options);

    public record ExcelImportParseResult(List<ParsedQuestionRow> Rows, List<string> SkippedWorksheetNames, List<string> Warnings);

    /// <summary>
    /// Parses the multi-worksheet question-bank workbook produced by the frontend's
    /// excelGenerator.ts (one worksheet per assessment section, "Instructions" sheet skipped).
    /// Kept behind an interface so the Application layer never takes a direct ClosedXML dependency.
    /// </summary>
    public interface IExcelQuestionImportParser
    {
        ExcelImportParseResult Parse(Stream fileStream);
    }
}
