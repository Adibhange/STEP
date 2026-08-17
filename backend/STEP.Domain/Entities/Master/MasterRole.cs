using System.Collections.Generic;

namespace STEP.Domain.Entities.Master
{
    /// <summary>Candidate/vacancy job-title taxonomy (e.g. "Software Engineer", "DevOps Specialist").</summary>
    public class MasterRole : MasterDataEntity
    {
        public ICollection<RoleHiringProfile> HiringProfiles { get; set; } = new List<RoleHiringProfile>();
    }
}
