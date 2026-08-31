using System;
using System.Threading;
using System.Threading.Tasks;

namespace STEP.Application.Common.Interfaces
{
    public interface IInterviewerNotificationService
    {
        Task SendInterviewNotificationsAsync(
            int interviewId,
            string? currentHrEmail = null,
            string? currentHrName = null,
            CancellationToken cancellationToken = default);

        string GenerateTeamsDirectChatLink(
            string interviewerEmail,
            string interviewerFirstName,
            string candidateName,
            string candidateCode,
            string vacancyTitle,
            string roundTitle,
            decimal experienceYears,
            int candidateId,
            string mode = "Face-to-Face",
            string? meetingLink = null);
    }
}
