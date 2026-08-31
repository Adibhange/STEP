using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Models;

namespace STEP.Infrastructure.Services
{
    public class EmailService(
        IOptions<EmailSettings> emailSettingsOptions,
        ILogger<EmailService> logger) : IEmailService
    {
        private readonly EmailSettings _settings = emailSettingsOptions.Value;

        public async Task SendEmailAsync(
            string toEmail,
            string subject,
            string htmlBody,
            string? replyTo = null,
            string? cc = null,
            string? bcc = null,
            string? icsCalendarAttachment = null,
            string? icsFileName = null,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(toEmail))
            {
                logger.LogWarning("[EmailService] Skipped sending email: recipient email address is empty.");
                return;
            }

            try
            {
                using var mail = new MailMessage();
                mail.From = new MailAddress(_settings.SenderEmail, _settings.SenderDisplayName, Encoding.UTF8);
                mail.To.Add(new MailAddress(toEmail.Trim()));
                mail.Subject = subject;
                mail.SubjectEncoding = Encoding.UTF8;
                mail.Body = htmlBody;
                mail.BodyEncoding = Encoding.UTF8;
                mail.IsBodyHtml = true;

                // Reply-To
                if (!string.IsNullOrWhiteSpace(replyTo))
                {
                    mail.ReplyToList.Add(new MailAddress(replyTo.Trim()));
                }

                // CC Handling (Specific CC + Central Default CC)
                if (!string.IsNullOrWhiteSpace(cc))
                {
                    foreach (var addr in cc.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                    {
                        mail.CC.Add(new MailAddress(addr));
                    }
                }
                if (!string.IsNullOrWhiteSpace(_settings.DefaultCc))
                {
                    foreach (var addr in _settings.DefaultCc.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                    {
                        if (!mail.CC.Contains(new MailAddress(addr)) && !mail.To.Contains(new MailAddress(addr)))
                        {
                            mail.CC.Add(new MailAddress(addr));
                        }
                    }
                }

                // BCC Handling (Specific BCC + Central Default BCC)
                if (!string.IsNullOrWhiteSpace(bcc))
                {
                    foreach (var addr in bcc.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                    {
                        mail.Bcc.Add(new MailAddress(addr));
                    }
                }
                if (!string.IsNullOrWhiteSpace(_settings.DefaultBcc))
                {
                    foreach (var addr in _settings.DefaultBcc.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                    {
                        if (!mail.Bcc.Contains(new MailAddress(addr)))
                        {
                            mail.Bcc.Add(new MailAddress(addr));
                        }
                    }
                }

                // Optional .ics Calendar Attachment
                if (!string.IsNullOrWhiteSpace(icsCalendarAttachment))
                {
                    var calendarBytes = Encoding.UTF8.GetBytes(icsCalendarAttachment);
                    var stream = new MemoryStream(calendarBytes);
                    var attachment = new Attachment(stream, icsFileName ?? "interview-invitation.ics", "text/calendar; method=REQUEST; charset=UTF-8");
                    mail.Attachments.Add(attachment);
                }

                // Check if SMTP Password is configured
                if (string.IsNullOrWhiteSpace(_settings.Password))
                {
                    logger.LogInformation(
                        "[EmailService] Mode: OFFLINE/DEV. Email to '{To}' | Subject: '{Subject}' | CC: '{Cc}' | BCC: '{Bcc}' recorded successfully (SMTP password not set in appsettings).",
                        toEmail, subject, mail.CC.ToString(), mail.Bcc.ToString());
                    return;
                }

                // Production SMTP Transmission
                using var smtp = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
                {
                    EnableSsl = _settings.EnableSsl,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(_settings.Username ?? _settings.SenderEmail, _settings.Password),
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    Timeout = 15000
                };

                await smtp.SendMailAsync(mail, cancellationToken);
                logger.LogInformation("[EmailService] Email successfully delivered to '{To}' via SMTP server '{Host}'.", toEmail, _settings.SmtpHost);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[EmailService] Failed to send email to '{To}' with subject '{Subject}'.", toEmail, subject);
            }
        }

        public string GenerateIcsCalendar(
            string eventUid,
            string title,
            string description,
            string locationOrLink,
            DateTime startTimeUtc,
            DateTime endTimeUtc,
            string organizerEmail,
            string organizerName,
            string attendeeEmail,
            string attendeeName)
        {
            var nowUtc = DateTime.UtcNow.ToString("yyyyMMddTHHmmssZ");
            var startUtcStr = startTimeUtc.ToString("yyyyMMddTHHmmssZ");
            var endUtcStr = endTimeUtc.ToString("yyyyMMddTHHmmssZ");

            var sb = new StringBuilder();
            sb.AppendLine("BEGIN:VCALENDAR");
            sb.AppendLine("VERSION:2.0");
            sb.AppendLine("PRODID:-//STEP Platform//Talent Excellence//EN");
            sb.AppendLine("CALSCALE:GREGORIAN");
            sb.AppendLine("METHOD:REQUEST");
            sb.AppendLine("BEGIN:VEVENT");
            sb.AppendLine($"UID:{eventUid}@sthapatya.in");
            sb.AppendLine($"DTSTAMP:{nowUtc}");
            sb.AppendLine($"DTSTART:{startUtcStr}");
            sb.AppendLine($"DTEND:{endUtcStr}");
            sb.AppendLine($"SUMMARY:{title}");
            sb.AppendLine($"DESCRIPTION:{description.Replace("\r\n", "\\n").Replace("\n", "\\n")}");
            sb.AppendLine($"LOCATION:{locationOrLink}");
            sb.AppendLine("STATUS:CONFIRMED");
            sb.AppendLine("SEQUENCE:0");
            sb.AppendLine($"ORGANIZER;CN={organizerName}:mailto:{organizerEmail}");
            sb.AppendLine($"ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN={attendeeName}:mailto:{attendeeEmail}");
            sb.AppendLine("BEGIN:VALARM");
            sb.AppendLine("TRIGGER:-PT15M");
            sb.AppendLine("ACTION:DISPLAY");
            sb.AppendLine($"DESCRIPTION:Reminder: {title}");
            sb.AppendLine("END:VALARM");
            sb.AppendLine("END:VEVENT");
            sb.AppendLine("END:VCALENDAR");

            return sb.ToString();
        }
    }
}
