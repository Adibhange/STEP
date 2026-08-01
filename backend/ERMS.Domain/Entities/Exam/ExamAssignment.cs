using System;
using ERMS.Domain.Common;
using ERMS.Domain.Entities.Question;
using ERMS.Domain.Entities.Vacancy;

namespace ERMS.Domain.Entities.Exam
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
