using STEP.Domain.Common;

namespace STEP.Domain.Entities.Question
{
    public class TemplateSection : BaseEntity
    {
        public int TemplateId { get; set; }
        public AssessmentTemplate? Template { get; set; }

        public string SectionName { get; set; } = string.Empty;
        public int? DurationMinutes { get; set; }
        public int QuestionCount { get; set; } = 10;
    }
}
