using System;
using ERMS.Domain.Common;
using ERMS.Domain.Entities.Candidate;
using ERMS.Domain.Entities.Vacancy;

namespace ERMS.Domain.Entities.Interview
{
    public class CandidateStageProgress : BaseEntity
    {
        public int CandidateId { get; set; }
        public Candidate.Candidate? Candidate { get; set; }

        public int VacancyStageId { get; set; }
        public VacancyStage? VacancyStage { get; set; }

        public string StageStatus { get; set; } = "Scheduled"; // Scheduled, InProgress, Passed, Failed, Skipped
        public DateTime? CompletedDate { get; set; }
    }
}
