using System;
using System.Threading;
using System.Threading.Tasks;

namespace STEP.Application.Common.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(
            string toEmail,
            string subject,
            string htmlBody,
            string? replyTo = null,
            string? cc = null,
            string? bcc = null,
            string? icsCalendarAttachment = null,
            string? icsFileName = null,
            CancellationToken cancellationToken = default);

        string GenerateIcsCalendar(
            string eventUid,
            string title,
            string description,
            string locationOrLink,
            DateTime startTimeUtc,
            DateTime endTimeUtc,
            string organizerEmail,
            string organizerName,
            string attendeeEmail,
            string attendeeName);
    }
}
