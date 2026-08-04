using System;
using System.Collections.Generic;
using STEP.Domain.Common;
using STEP.Domain.Entities.QR;
using STEP.Domain.Entities.Vacancy;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;

namespace STEP.Domain.Entities.Candidate
{
    /// <summary>
    /// Candidate.CurrentPipelineProgressId is a "current pointer" into this candidate's own
    /// CandidatePipelineProgress rows (single source of truth for where they are in the flow).
    /// Not to be confused with Identity.User, which models internal staff.
    /// </summary>
    public class Candidate : BaseEntity
    {
        public string CandidateCode { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        public int VacancyId { get; set; }
        public VacancyEntity Vacancy { get; set; } = null!;

        public int? CurrentPipelineProgressId { get; set; }
        public CandidatePipelineProgress? CurrentPipelineProgress { get; set; }

        /// <summary>Cached projection of CurrentPipelineProgress.RoundTitle, kept in sync for fast list rendering.</summary>
        public string CurrentStage { get; set; } = "Registered";

        /// <summary>Applied / In-Progress / Offered / Rejected / Withdrawn.</summary>
        public string Status { get; set; } = "Applied";

        /// <summary>Walk-in / Office / Referral / Portal / Recruiter.</summary>
        public string RegistrationChannel { get; set; } = string.Empty;

        /// <summary>Set when this candidate registered by scanning a walk-in drive QR code.</summary>
        public int? QRCodeId { get; set; }
        public QRCode? QRCode { get; set; }

        public string? ReferralEmployeeName { get; set; }
        public decimal TotalExperienceYears { get; set; }
        public decimal? CurrentCTC { get; set; }
        public decimal? ExpectedCTC { get; set; }
        public int? NoticePeriodDays { get; set; }
        public string? CurrentLocation { get; set; }
        public string? HighestQualification { get; set; }

        /// <summary>
        /// BCrypt hash of the candidate's self-service exam login passcode. Generated (and handed
        /// back once, in plaintext, in the API response — there's no email/SMS delivery channel
        /// until Phase 5's Outbox exists) the moment their current round becomes an Assessment round.
        /// </summary>
        public string? ExamPasscodeHash { get; set; }

        public ICollection<CandidateDocument> Documents { get; set; } = new List<CandidateDocument>();
        public ICollection<CandidatePipelineProgress> PipelineProgressHistory { get; set; } = new List<CandidatePipelineProgress>();
    }
}
