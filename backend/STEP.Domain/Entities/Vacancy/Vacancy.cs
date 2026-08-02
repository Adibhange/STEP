using System;
using System.Collections.Generic;
using STEP.Domain.Common;
using STEP.Domain.Entities.Master;

namespace STEP.Domain.Entities.Vacancy
{
    public class Vacancy : BaseEntity
    {
        public string VacancyCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        
        public int LocationId { get; set; }
        public Location? Location { get; set; }

        public decimal MinExperienceYears { get; set; }
        public decimal MaxExperienceYears { get; set; }
        public int OpeningsCount { get; set; }
        public string Status { get; set; } = "Draft"; // Draft, Approved, Published, Closed
        public DateTime TargetClosureDate { get; set; }

        public ICollection<VacancyStage> VacancyStages { get; set; } = new List<VacancyStage>();
    }
}
