using System;
using System.Collections.Generic;
using STEP.Domain.Common;
using STEP.Domain.Entities.Identity;
using STEP.Domain.Entities.Master;

namespace STEP.Domain.Entities.Vacancy
{
    /// <summary>
    /// Phase 2: core vacancy record. Owns its pipeline flow versions, assessment sections,
    /// question papers, and test-location mappings.
    /// </summary>
    public class Vacancy : BaseEntity
    {
        public string VacancyCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;

        public int MasterRoleId { get; set; }
        public MasterRole MasterRole { get; set; } = null!;

        public int DepartmentId { get; set; }
        public MasterDepartment Department { get; set; } = null!;

        public int HiringLocationId { get; set; }
        public MasterHiringLocation HiringLocation { get; set; } = null!;

        public int EmploymentTypeId { get; set; }
        public MasterEmploymentType EmploymentType { get; set; } = null!;

        /// <summary>"Walk-in" or "Direct" — drives single vs. multi test-location selection in the wizard.</summary>
        public string DriveType { get; set; } = "Direct";

        /// <summary>"Draft" / "Active" / "Closed" per the blueprint's lifecycle.</summary>
        public string Status { get; set; } = "Draft";

        public string WorkMode { get; set; } = "On-site"; // On-site / Hybrid / Remote

        public int TotalOpenings { get; set; }
        public decimal MinExperienceYears { get; set; }
        public decimal MaxExperienceYears { get; set; }
        public string? JobDescription { get; set; }

        public DateTime? ClosingDate { get; set; }
        public DateTime? WalkinDriveDate { get; set; }
        public TimeSpan? WalkinStartTime { get; set; }
        public TimeSpan? WalkinEndTime { get; set; }

        public int? AssignedRecruiterId { get; set; }
        public User? AssignedRecruiter { get; set; }

        public int? HiringManagerId { get; set; }
        public User? HiringManager { get; set; }

        public int? AssessmentBlueprintId { get; set; }
        public Exam.AssessmentBlueprint? AssessmentBlueprint { get; set; }
        public decimal? PassingPercentageOverride { get; set; }

        public ICollection<VacancyTestLocation> TestLocations { get; set; } = new List<VacancyTestLocation>();
        public ICollection<VacancyPipelineFlow> PipelineFlows { get; set; } = new List<VacancyPipelineFlow>();
        public ICollection<VacancyAssessmentSection> AssessmentSections { get; set; } = new List<VacancyAssessmentSection>();
        public ICollection<VacancyQuestionPaper> QuestionPapers { get; set; } = new List<VacancyQuestionPaper>();
    }
}
