using System;
using System.Collections.Generic;
using STEP.Domain.Common;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;

namespace STEP.Domain.Entities.QR
{
    /// <summary>
    /// One QR code per walk-in drive venue. RegistrationUrl is what the physical QR image encodes;
    /// candidates who scan it land on a public self-registration form scoped to this drive/vacancy.
    /// </summary>
    public class QRCode : BaseEntity
    {
        public int VacancyId { get; set; }
        public VacancyEntity Vacancy { get; set; } = null!;

        /// <summary>Short unique code embedded in RegistrationUrl, e.g. "WD-7F3A9C2B".</summary>
        public string Code { get; set; } = string.Empty;
        public string RegistrationUrl { get; set; } = string.Empty;

        public string VenueName { get; set; } = string.Empty;
        public string? VenueAddress { get; set; }
        public DateTime DriveDate { get; set; }
        public TimeSpan? DriveStartTime { get; set; }
        public TimeSpan? DriveEndTime { get; set; }
        public int? Capacity { get; set; }
        public DateTime? RegistrationDeadline { get; set; }

        /// <summary>Active / Expired / Cancelled.</summary>
        public string Status { get; set; } = "Active";

        public ICollection<QRScanAnalytic> ScanAnalytics { get; set; } = new List<QRScanAnalytic>();
    }
}
