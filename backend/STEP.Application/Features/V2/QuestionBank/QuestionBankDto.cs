using System;
using System.Collections.Generic;

namespace STEP.Application.Features.V2.QuestionBank
{
    public record QuestionBankOptionDto(
        int Id,
        string Label,
        string Text,
        bool IsCorrect,
        int DisplayOrder
    );

    public record QuestionBankItemDto(
        int Id,
        string Code,
        string Language,
        string SectionType,
        string QuestionType,
        string ExperienceTier,
        string QuestionText,
        decimal Marks,
        string? SqlSchema,
        string? StarterCode,
        string? TestCases,
        bool IsActive,
        DateTime CreatedAt,
        DateTime? UpdatedAt,
        List<QuestionBankOptionDto> Options
    );

    public record QuestionTierDistributionDto(
        int Fresher,
        int Junior,
        int MidLevel,
        int Senior,
        int Lead
    );

    public record QuestionBankSearchResultDto(
        List<QuestionBankItemDto> Items,
        int TotalCount,
        int PageIndex,
        int PageSize,
        QuestionTierDistributionDto TierDistribution
    );
}
