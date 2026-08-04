using System;
using STEP.Domain.Common;
using STEP.Domain.Entities.Identity;

namespace STEP.Domain.Entities.Interview
{
    /// <summary>One panelist's scorecard for one Interview.</summary>
    public class InterviewRoundDetail : BaseEntity
    {
        public int InterviewId { get; set; }
        public Interview Interview { get; set; } = null!;

        public int PanelistUserId { get; set; }
        public User Panelist { get; set; } = null!;

        public int TechnicalRating { get; set; }
        public int CommunicationRating { get; set; }
        public int ProblemSolvingRating { get; set; }
        public int CulturalFitRating { get; set; }

        public string? Strengths { get; set; }
        public string? Weaknesses { get; set; }

        /// <summary>Hire / Reject / OnHold.</summary>
        public string Recommendation { get; set; } = "OnHold";
        public string? Comments { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
}
