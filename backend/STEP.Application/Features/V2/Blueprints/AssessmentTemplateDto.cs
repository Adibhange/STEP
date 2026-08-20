using System;
using System.Collections.Generic;

namespace STEP.Application.Features.V2.Blueprints
{
    public record AssessmentSectionRuleDto(
        int Id,
        int BlueprintId,
        string SectionName,
        string SectionType,
        string QuestionType,
        string ExperienceTier,
        string RequiredTags,
        int QuestionCount,
        decimal MarksPerQuestion,
        int? TimeLimitMinutes,
        string SelectionStrategy,
        int DisplayOrder,
        bool IsActive
    );

    public record AssessmentTemplateDto(
        int Id,
        string Code,
        string Name,
        decimal DefaultPassingPercentage,
        int TotalDurationMinutes,
        int TotalQuestions,
        decimal TotalMarks,
        bool EnableQuestionShuffling,
        bool EnableOptionShuffling,
        bool IsDefault,
        bool IsActive,
        List<AssessmentSectionRuleDto> SectionRules
    );
}
