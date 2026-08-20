using System;
using STEP.Domain.Common;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Domain.Entities.Identity
{
    /// <summary>
    /// 24-hour Director Access Link entity for instant candidate review portal (lives under "staffv2" schema).
    /// </summary>
    public class DirectorAccessLink : BaseEntity
    {
        public string Token { get; set; } = string.Empty;
        public int CandidateId { get; set; }
        public CandidateEntity Candidate { get; set; } = null!;
        public DateTimeOffset ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }
        public DateTimeOffset? RevokedAt { get; set; }
    }
}
