using System.Collections.Generic;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Question
{
    public class AssessmentTemplate : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public int TotalDurationMinutes { get; set; } = 60;
        public decimal PassPercentage { get; set; } = 60.0m;
        public bool ShuffleQuestions { get; set; } = true;
        public bool ShuffleOptions { get; set; } = true;

        public ICollection<TemplateSection> Sections { get; set; } = new List<TemplateSection>();
    }
}
