using System;
using STEP.Domain.Entities.QR;

namespace STEP.Application.Features.QR.Common
{
    /// <summary>Shared by RecordQRScanCommand and RegisterCandidateViaQRCommand.</summary>
    public static class QRCodeAvailability
    {
        public static (bool IsOpen, string? Message) Check(QRCode qrCode, int currentRegistrationCount)
        {
            if (qrCode.Status != "Active")
            {
                return (false, $"This registration drive is no longer active (status: {qrCode.Status}).");
            }

            if (qrCode.RegistrationDeadline is DateTime deadline && DateTime.UtcNow > deadline)
            {
                return (false, "The registration deadline for this drive has passed.");
            }

            if (qrCode.Capacity is int capacity && currentRegistrationCount >= capacity)
            {
                return (false, "This drive has reached its registration capacity.");
            }

            return (true, null);
        }
    }
}
