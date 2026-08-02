using System;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Candidate
{
    public class CandidateWorkExperience : BaseEntity
    {
        public int CandidateId { get; set; }
        public Candidate? Candidate { get; set; }

        public string CompanyName { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrentJob { get; set; } = false;
    }
}
