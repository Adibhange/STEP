using System;
using STEP.Domain.Common;

namespace STEP.Domain.Entities.Candidate
{
    public class CandidateDocument : BaseEntity
    {
        public int CandidateId { get; set; }
        public Candidate? Candidate { get; set; }

        public string DocumentType { get; set; } = string.Empty; // Resume, Photo, IDProof, Marksheet, OfferLetter
        public string FilePath { get; set; } = string.Empty;
        public DateTime UploadedDate { get; set; } = DateTime.UtcNow;
    }
}
