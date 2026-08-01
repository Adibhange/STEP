using System;
using System.Collections.Generic;
using ERMS.Domain.Common;
using ERMS.Domain.Entities.Candidate;

namespace ERMS.Domain.Entities.Exam
{
    public class ExamSession : BaseEntity
    {
        public string SessionToken { get; set; } = Guid.NewGuid().ToString("N");
        
        public int CandidateId { get; set; }
        public Candidate.Candidate? Candidate { get; set; }

        public int ExamAssignmentId { get; set; }
        public ExamAssignment? ExamAssignment { get; set; }

        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime ScheduledExpiryTime { get; set; }
        
        public string Status { get; set; } = "Created"; // Created, InProgress, Submitted, AutoSubmitted, Disqualified
        public decimal? TotalObtainedMarks { get; set; }
        public string FinalResult { get; set; } = "PendingEvaluation"; // Pass, Fail, PendingEvaluation
        public decimal RiskScore { get; set; } = 0.0m;

        public ICollection<ExamAnswer> Answers { get; set; } = new List<ExamAnswer>();
        public ICollection<ExamViolation> Violations { get; set; } = new List<ExamViolation>();
    }
}
