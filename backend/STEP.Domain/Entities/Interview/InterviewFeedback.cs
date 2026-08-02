using STEP.Domain.Common;

namespace STEP.Domain.Entities.Interview
{
    public class InterviewFeedback : BaseEntity
    {
        public int ScheduleId { get; set; }
        public InterviewSchedule? Schedule { get; set; }

        public int TechnicalRating { get; set; } = 3; // 1-5 Scale
        public int CommunicationRating { get; set; } = 3;
        public int ProblemSolvingRating { get; set; } = 3;
        public int CulturalFitRating { get; set; } = 3;

        public string Strengths { get; set; } = string.Empty;
        public string Weaknesses { get; set; } = string.Empty;
        public string Recommendation { get; set; } = "Hire"; // StrongHire, Hire, Hold, Reject
        public string Comments { get; set; } = string.Empty;
    }
}
