using System;
using STEP.Domain.Common;
using STEP.Domain.Entities.Staff;

namespace STEP.Domain.Entities.Interview
{
    public class InterviewSchedule : BaseEntity
    {
        public int ProgressId { get; set; }
        public CandidateStageProgress? Progress { get; set; }

        public int InterviewerUserId { get; set; }
        public User? InterviewerUser { get; set; }

        public DateTime ScheduledStartTime { get; set; }
        public DateTime ScheduledEndTime { get; set; }
        public string? MeetingLink { get; set; }
        public string? LocationDetails { get; set; }
    }
}
