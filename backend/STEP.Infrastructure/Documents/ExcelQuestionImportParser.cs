using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using ClosedXML.Excel;
using STEP.Application.Common.Interfaces;

namespace STEP.Infrastructure.Documents
{
    /// <summary>
    /// Reads the multi-worksheet question-bank workbook (see frontend/src/features/vacancies/utils/excelGenerator.ts):
    /// one worksheet per assessment section named "Sec {order}-{title}", "Instructions" sheet skipped.
    /// Column layout depends on the row's own question_type value, not the worksheet's nominal category,
    /// so every row is read defensively by header name rather than fixed column index.
    /// </summary>
    public partial class ExcelQuestionImportParser : IExcelQuestionImportParser
    {
        [GeneratedRegex(@"^Sec\s*(\d+)\s*-", RegexOptions.IgnoreCase)]
        private static partial Regex SectionOrderPattern();

        public ExcelImportParseResult Parse(Stream fileStream)
        {
            using var workbook = new XLWorkbook(fileStream);
            var rows = new List<ParsedQuestionRow>();
            var skipped = new List<string>();

            foreach (var worksheet in workbook.Worksheets)
            {
                if (string.Equals(worksheet.Name, "Instructions", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var match = SectionOrderPattern().Match(worksheet.Name);
                int? sectionOrder = match.Success ? int.Parse(match.Groups[1].Value) : null;
                if (sectionOrder == null)
                {
                    skipped.Add(worksheet.Name);
                    continue;
                }

                var headerRow = worksheet.Row(1);
                var lastCol = headerRow.LastCellUsed()?.Address.ColumnNumber ?? 0;
                var columnIndex = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                for (var c = 1; c <= lastCol; c++)
                {
                    var header = headerRow.Cell(c).GetString().Trim();
                    if (!string.IsNullOrEmpty(header))
                    {
                        columnIndex[header] = c;
                    }
                }

                string Cell(IXLRow row, string header) =>
                    columnIndex.TryGetValue(header, out var col) ? row.Cell(col).GetString().Trim() : string.Empty;

                var lastRow = worksheet.LastRowUsed()?.RowNumber() ?? 1;
                for (var r = 2; r <= lastRow; r++)
                {
                    var row = worksheet.Row(r);
                    var questionText = Cell(row, "question_text");
                    if (string.IsNullOrWhiteSpace(questionText))
                    {
                        continue;
                    }

                    var questionType = Cell(row, "question_type").ToUpperInvariant();
                    var options = new List<ParsedOption>();

                    if (questionType is "SINGLE_CHOICE" or "MULTI_CHOICE")
                    {
                        var correctLabels = Cell(row, "correct_option")
                            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                            .Select(l => l.ToUpperInvariant())
                            .ToHashSet();

                        foreach (var label in new[] { "A", "B", "C", "D" })
                        {
                            var text = Cell(row, $"option_{label.ToLowerInvariant()}");
                            if (!string.IsNullOrWhiteSpace(text))
                            {
                                options.Add(new ParsedOption(label, text, correctLabels.Contains(label)));
                            }
                        }
                    }

                    string? programmingLanguage = questionType == "CODING" ? Cell(row, "programming_language") : null;
                    string? sqlSchema = questionType == "SQL" ? Cell(row, "db_schema_ddl") : null;
                    int? maxWordCount = null;
                    if (questionType == "SUBJECTIVE" && int.TryParse(Cell(row, "max_word_count"), out var mwc))
                    {
                        maxWordCount = mwc;
                    }

                    rows.Add(new ParsedQuestionRow(
                        sectionOrder,
                        string.IsNullOrEmpty(questionType) ? "SUBJECTIVE" : questionType,
                        questionText,
                        programmingLanguage,
                        sqlSchema,
                        maxWordCount,
                        options));
                }
            }

            return new ExcelImportParseResult(rows, skipped);
        }
    }
}
