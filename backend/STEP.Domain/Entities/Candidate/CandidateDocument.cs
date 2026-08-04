using System;
using STEP.Domain.Common;
using STEP.Domain.Entities.Identity;

namespace STEP.Domain.Entities.Candidate
{
    /// <summary>
    /// Exactly 3 document slots per candidate — one row per (CandidateId, DocumentType):
    /// "Resume", "Application Form", "Profile Photo" (see frontend CandidateProfilePage.tsx).
    /// StorageProvider records where the physical file actually lives, so a future migration
    /// to cloud storage doesn't require a schema change.
    /// </summary>
    public class CandidateDocument : BaseEntity
    {
        public int CandidateId { get; set; }
        public Candidate Candidate { get; set; } = null!;

        /// <summary>"Resume" / "Application Form" / "Profile Photo".</summary>
        public string DocumentType { get; set; } = string.Empty;

        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }

        /// <summary>"Local" today; "AzureBlob"/"S3" are future-compatible values, no schema change needed.</summary>
        public string StorageProvider { get; set; } = "Local";

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public int? UploadedById { get; set; }
        public User? UploadedBy { get; set; }
    }
}
