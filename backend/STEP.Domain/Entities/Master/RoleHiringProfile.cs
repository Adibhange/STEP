using System;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Master
{
    /// <summary>
    /// V2 Hiring Profile Template matrix under a MasterRole (e.g. Fresher, 1-2 Years, 2-4 Years).
    /// Encapsulates the entire automated recruitment strategy for a specific role and experience tier.
    /// </summary>
    public class RoleHiringProfile : BaseEntity
    {
        public int MasterRoleId { get; set; }
        public MasterRole MasterRole { get; set; } = null!;

        public string ProfileName { get; set; } = string.Empty; // e.g. "Fresher", "1-2 Years", "2-4 Years"
        public int? ExperienceLevelId { get; set; }
        public MasterExperienceLevel? ExperienceLevel { get; set; }

        public decimal MinExperienceYears { get; set; }
        public decimal MaxExperienceYears { get; set; }

        public int? QuestionPaperTemplateId { get; set; }
        public decimal PassingPercentage { get; set; } = 70.00m;

        public int? PipelineFlowTemplateId { get; set; }

        // Continuous Automation Configuration
        public bool AutoAdvanceOnPass { get; set; } = true;
        public bool AutoRejectOnFail { get; set; } = true;
        public bool AutoPrepareOfferOnFinalPass { get; set; } = true;
        public decimal? DefaultBaseCTC { get; set; }

        public bool IsDefault { get; set; } = false;
        public bool IsActive { get; set; } = true;

        public ICollection<RoleAssessmentSectionRule> SectionRules { get; set; } = new List<RoleAssessmentSectionRule>();
    }
}
