using System;
using System.Collections.Generic;
using ERMS.Domain.Common;
using ERMS.Domain.Entities.Master;

namespace ERMS.Domain.Entities.Candidate
{
    public class Candidate : BaseEntity
    {
        public string CandidateCode { get; set; } = string.Empty;
        public int VacancyId { get; set; }
        public Vacancy.Vacancy? Vacancy { get; set; }

        public string SourceType { get; set; } = "CareerPortal"; // WalkIn, HomeTest, CampusDrive, Referral, Agency, CareerPortal
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public DateTime DOB { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        
        public int LocationId { get; set; }
        public Location? Location { get; set; }

        public decimal? CurrentSalary { get; set; }
        public decimal? ExpectedSalary { get; set; }
        public int? NoticePeriodDays { get; set; }
        public int OverallExperienceMonths { get; set; } = 0;

        public string? PhotoPath { get; set; }
        public string? ResumePath { get; set; }
        public string Status { get; set; } = "Registered"; // Registered, PendingVerification, Verified, InAssessment, InInterview, Offered, Rejected, Hired

        public ICollection<CandidateEducation> EducationHistory { get; set; } = new List<CandidateEducation>();
        public ICollection<CandidateWorkExperience> WorkHistory { get; set; } = new List<CandidateWorkExperience>();
        public ICollection<CandidateDocument> Documents { get; set; } = new List<CandidateDocument>();
    }
}
