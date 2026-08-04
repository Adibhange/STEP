using System;
using System.Collections.Generic;
using STEP.Domain.Common;
using STEP.Domain.Entities.Candidate;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Domain.Entities.Interview
{
    /// <summary>One scheduled interview for a candidate's current (Interview-classified) pipeline round.</summary>
    public class Interview : BaseEntity
    {
        public int CandidatePipelineProgressId { get; set; }
        public CandidatePipelineProgress CandidatePipelineProgress { get; set; } = null!;

        public int CandidateId { get; set; }
        public CandidateEntity Candidate { get; set; } = null!;

        public DateTime ScheduledAt { get; set; }
        public int DurationMinutes { get; set; }

        /// <summary>Online / Onsite / Phone.</summary>
        public string Mode { get; set; } = "Online";
        public string? MeetingLinkOrLocation { get; set; }

        /// <summary>Scheduled / Completed / Cancelled / Rescheduled / NoShow.</summary>
        public string Status { get; set; } = "Scheduled";

        public ICollection<InterviewRoundDetail> RoundDetails { get; set; } = new List<InterviewRoundDetail>();
    }
}
