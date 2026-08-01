using System;
using ERMS.Domain.Common;
using ERMS.Domain.Entities.Staff;

namespace ERMS.Domain.Entities.Interview
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
