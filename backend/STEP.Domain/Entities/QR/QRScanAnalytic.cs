using System;
using STEP.Domain.Common;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Domain.Entities.QR
{
    /// <summary>One row per scan/visit of a QRCode's registration link; ResultedInRegistration flips true when it converts.</summary>
    public class QRScanAnalytic : BaseEntity
    {
        public int QRCodeId { get; set; }
        public QRCode QRCode { get; set; } = null!;

        public DateTime ScannedAt { get; set; } = DateTime.UtcNow;
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }

        public bool ResultedInRegistration { get; set; } = false;
        public int? CandidateId { get; set; }
        public CandidateEntity? Candidate { get; set; }
    }
}
