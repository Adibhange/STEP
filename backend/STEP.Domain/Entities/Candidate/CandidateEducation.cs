using STEP.Domain.Common;

namespace STEP.Domain.Entities.Candidate
{
    public class CandidateEducation : BaseEntity
    {
        public int CandidateId { get; set; }
        public Candidate? Candidate { get; set; }

        public string Degree { get; set; } = string.Empty;
        public string College { get; set; } = string.Empty;
        public string University { get; set; } = string.Empty;
        public int PassingYear { get; set; }
        public decimal CGPA { get; set; }
    }
}
