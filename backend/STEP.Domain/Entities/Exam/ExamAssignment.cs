using System;
using STEP.Domain.Common;
using STEP.Domain.Entities.Question;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Domain.Entities.Exam
{
    public class ExamAssignment : BaseEntity
    {
        public int VacancyId { get; set; }
        public Vacancy.Vacancy? Vacancy { get; set; }

        public int TemplateId { get; set; }
        public AssessmentTemplate? Template { get; set; }

        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
    }
}
