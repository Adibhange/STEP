using STEP.Domain.Common;

namespace STEP.Domain.Entities.Master
{
    public class Permission : BaseEntity
    {
        public string Module { get; set; } = string.Empty; // e.g. Vacancy, Candidate, Exam, Interview, Report
        public string Action { get; set; } = string.Empty; // e.g. View, Create, Edit, Delete, Export, Approve
        public string Description { get; set; } = string.Empty;
    }
}
