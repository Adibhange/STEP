using System;
using STEP.Domain.Common;
using STEP.Domain.Entities.Identity;
using STEP.Domain.Entities.Vacancy;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;

namespace STEP.Domain.Entities.Interview
{
    /// <summary>
    /// Requires Director PIN verification (ApproveOfferCommand) before it can be Sent — mandatory
    /// high-privilege approval per the blueprint.
    /// </summary>
    public class OfferLetter : BaseEntity
    {
        public int CandidateId { get; set; }
        public CandidateEntity Candidate { get; set; } = null!;

        public int VacancyId { get; set; }
        public VacancyEntity Vacancy { get; set; } = null!;

        public decimal OfferedCTC { get; set; }
        public DateTime JoiningDate { get; set; }

        /// <summary>Draft / PendingApproval / Approved / Sent / Accepted / Declined / Withdrawn.</summary>
        public string Status { get; set; } = "Draft";

        public int PreparedById { get; set; }
        public User PreparedBy { get; set; } = null!;

        public int? ApprovedById { get; set; }
        public User? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }

        /// <summary>Relative path to the QuestPDF-generated offer letter PDF.</summary>
        public string? GeneratedPdfPath { get; set; }
    }
}
