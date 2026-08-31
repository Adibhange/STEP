using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Models;
using STEP.Domain.Entities.Notification;

using Microsoft.AspNetCore.Http;

namespace STEP.Infrastructure.Services
{
    public class InterviewerNotificationService(
        IApplicationDbContext db,
        IEmailService emailService,
        IOptions<EmailSettings> emailSettingsOptions,
        ILogger<InterviewerNotificationService> logger,
        IHttpContextAccessor? httpContextAccessor = null) : IInterviewerNotificationService
    {
        private readonly EmailSettings _settings = emailSettingsOptions.Value;

        private string GetResolvedAppBaseUrl()
        {
            // 1. Priority: Environment variables (APP_BASE_URL or FRONTEND_URL in production/Docker/K8s)
            var envUrl = Environment.GetEnvironmentVariable("APP_BASE_URL")
                      ?? Environment.GetEnvironmentVariable("FRONTEND_URL");
            if (!string.IsNullOrWhiteSpace(envUrl))
            {
                return envUrl.TrimEnd('/');
            }

            // 2. Dynamic: Resolve origin from incoming HTTP request headers (Origin / Referer / Host)
            var httpContext = httpContextAccessor?.HttpContext;
            if (httpContext != null)
            {
                var origin = httpContext.Request.Headers.Origin.ToString();
                if (string.IsNullOrWhiteSpace(origin))
                {
                    origin = httpContext.Request.Headers.Referer.ToString();
                }

                if (!string.IsNullOrWhiteSpace(origin) && Uri.TryCreate(origin, UriKind.Absolute, out var parsedUri))
                {
                    return $"{parsedUri.Scheme}://{parsedUri.Authority}".TrimEnd('/');
                }

                if (httpContext.Request.Host.HasValue)
                {
                    var scheme = httpContext.Request.Scheme ?? "https";
                    return $"{scheme}://{httpContext.Request.Host}".TrimEnd('/');
                }
            }

            // 3. Fallback: Configured AppBaseUrl from appsettings.json
            if (!string.IsNullOrWhiteSpace(_settings.AppBaseUrl))
            {
                return _settings.AppBaseUrl.TrimEnd('/');
            }

            return "http://localhost:3000";
        }

        public string GenerateTeamsDirectChatLink(
            string interviewerEmail,
            string interviewerFirstName,
            string candidateName,
            string candidateCode,
            string vacancyTitle,
            string roundTitle,
            decimal experienceYears,
            int candidateId,
            string mode = "Face-to-Face",
            string? meetingLink = null)
        {
            var expText = experienceYears == 0 ? "Fresher" : $"{experienceYears:0.#} Yrs";
            var modeDisplay = string.Equals(mode, "Online", StringComparison.OrdinalIgnoreCase) ? "Online Video" : "Face-to-Face";
            var baseUrl = GetResolvedAppBaseUrl();
            var candidateScorecardUrl = $"{baseUrl}/dashboard/candidates/{candidateId}";

            var sb = new System.Text.StringBuilder();
            sb.AppendLine($"👋 Hi {interviewerFirstName},");
            sb.AppendLine();
            sb.AppendLine($"Candidate {candidateName} ({candidateCode}) has been assigned to you for a {modeDisplay} {roundTitle}.");
            sb.AppendLine();
            sb.AppendLine($"💼 Role: {vacancyTitle}");
            sb.AppendLine($"⏱️ Experience: {expText}");

            if (string.Equals(mode, "Online", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(meetingLink))
            {
                sb.AppendLine($"🎥 Meeting Link: {meetingLink}");
            }

            sb.AppendLine();
            sb.AppendLine("🔗 Candidate Profile & Evaluation Scorecard:");
            sb.AppendLine(candidateScorecardUrl);
            sb.AppendLine();
            sb.AppendLine("Please review their profile and conduct the evaluation in STEP.");

            var encodedUsers = HttpUtility.UrlEncode(interviewerEmail.Trim());
            var encodedMessage = HttpUtility.UrlEncode(sb.ToString());

            return $"https://teams.microsoft.com/l/chat/0/0?users={encodedUsers}&message={encodedMessage}";
        }

        public async Task SendInterviewNotificationsAsync(
            int interviewId,
            string? currentHrEmail = null,
            string? currentHrName = null,
            CancellationToken cancellationToken = default)
        {
            var interview = await db.Interviews
                .Include(i => i.Candidate)
                    .ThenInclude(c => c.Vacancy)
                .Include(i => i.CandidatePipelineProgress)
                .Include(i => i.InterviewerUser)
                .FirstOrDefaultAsync(i => i.Id == interviewId, cancellationToken);

            if (interview == null || interview.Candidate == null)
            {
                logger.LogWarning("[InterviewerNotificationService] Interview #{Id} not found.", interviewId);
                return;
            }

            var candidate = interview.Candidate;
            var interviewer = interview.InterviewerUser;
            var vacancyTitle = candidate.Vacancy?.Title ?? "Open Position";
            var roundTitle = interview.CandidatePipelineProgress?.RoundTitle ?? "Technical Interview";
            var isOnline = string.Equals(interview.Mode, "Online", StringComparison.OrdinalIgnoreCase);
            var scheduledAt = interview.ScheduledAt;
            var durationMinutes = interview.DurationMinutes > 0 ? interview.DurationMinutes : 60;
            var endTime = scheduledAt.AddMinutes(durationMinutes);
            var hrEmail = !string.IsNullOrWhiteSpace(currentHrEmail) ? currentHrEmail : _settings.SenderEmail;
            var hrName = !string.IsNullOrWhiteSpace(currentHrName) ? currentHrName : _settings.SenderDisplayName;

            // ── 1. SEND EMAIL TO CANDIDATE ─────────────────────────────────────────
            if (!string.IsNullOrWhiteSpace(candidate.Email))
            {
                var candidateSubject = $"[STEP Interview] Invitation: {roundTitle} — Sthapatya Consultants (SCIPL)";
                var candidateIcs = emailService.GenerateIcsCalendar(
                    eventUid: $"STEP-CAND-{interview.Id}-{DateTime.UtcNow.Ticks}",
                    title: $"[STEP Interview] {roundTitle} with SCIPL",
                    description: $"Interview with Sthapatya Consultants India Pvt. Ltd. (SCIPL)\\nRole: {vacancyTitle}\\nRound: {roundTitle}\\nMode: {(isOnline ? "Online Video" : "Face-to-Face")}",
                    locationOrLink: isOnline ? (interview.MeetingLinkOrLocation ?? "Online Video Meeting") : "Company Office Center",
                    startTimeUtc: scheduledAt.ToUniversalTime(),
                    endTimeUtc: endTime.ToUniversalTime(),
                    organizerEmail: hrEmail,
                    organizerName: hrName,
                    attendeeEmail: candidate.Email,
                    attendeeName: $"{candidate.FirstName} {candidate.LastName}".Trim());

                var candidateHtml = BuildCandidateEmailHtml(
                    candidateName: $"{candidate.FirstName} {candidate.LastName}".Trim(),
                    candidateCode: candidate.CandidateCode,
                    vacancyTitle: vacancyTitle,
                    roundTitle: roundTitle,
                    scheduledAt: scheduledAt,
                    durationMinutes: durationMinutes,
                    isOnline: isOnline,
                    meetingLink: interview.MeetingLinkOrLocation,
                    interviewerName: interviewer != null ? $"{interviewer.FirstName} {interviewer.LastName}".Trim() : "Technical Interview Panel",
                    hrName: hrName);

                await emailService.SendEmailAsync(
                    toEmail: candidate.Email,
                    subject: candidateSubject,
                    htmlBody: candidateHtml,
                    replyTo: hrEmail,
                    icsCalendarAttachment: candidateIcs,
                    icsFileName: "step-interview-invitation.ics",
                    cancellationToken: cancellationToken);
            }

            // ── 2. SEND EMAIL TO INTERVIEWER ───────────────────────────────────────
            if (interviewer != null && !string.IsNullOrWhiteSpace(interviewer.Email))
            {
                var interviewerSubject = $"[STEP Evaluation Briefing] Candidate Assigned: {candidate.FirstName} {candidate.LastName} ({candidate.CandidateCode}) — {roundTitle}";
                var baseUrl = GetResolvedAppBaseUrl();
                var candidateScorecardUrl = $"{baseUrl}/dashboard/candidates/{candidate.Id}";

                var interviewerIcs = emailService.GenerateIcsCalendar(
                    eventUid: $"STEP-INTV-{interview.Id}-{DateTime.UtcNow.Ticks}",
                    title: $"[STEP Evaluation] {candidate.FirstName} {candidate.LastName} ({candidate.CandidateCode}) — {roundTitle}",
                    description: $"Candidate Evaluation Session\\nCandidate: {candidate.FirstName} {candidate.LastName} ({candidate.CandidateCode})\\nRole: {vacancyTitle}\\nScorecard: {candidateScorecardUrl}",
                    locationOrLink: isOnline ? (interview.MeetingLinkOrLocation ?? "Online Video Meeting") : "Company Office Center",
                    startTimeUtc: scheduledAt.ToUniversalTime(),
                    endTimeUtc: endTime.ToUniversalTime(),
                    organizerEmail: hrEmail,
                    organizerName: hrName,
                    attendeeEmail: interviewer.Email,
                    attendeeName: $"{interviewer.FirstName} {interviewer.LastName}".Trim());

                var interviewerHtml = BuildInterviewerEmailHtml(
                    interviewerName: interviewer.FirstName,
                    candidateName: $"{candidate.FirstName} {candidate.LastName}".Trim(),
                    candidateCode: candidate.CandidateCode,
                    vacancyTitle: vacancyTitle,
                    roundTitle: roundTitle,
                    experienceYears: candidate.TotalExperienceYears,
                    scheduledAt: scheduledAt,
                    durationMinutes: durationMinutes,
                    isOnline: isOnline,
                    meetingLink: interview.MeetingLinkOrLocation,
                    scorecardUrl: candidateScorecardUrl);

                await emailService.SendEmailAsync(
                    toEmail: interviewer.Email,
                    subject: interviewerSubject,
                    htmlBody: interviewerHtml,
                    replyTo: hrEmail,
                    icsCalendarAttachment: interviewerIcs,
                    icsFileName: "step-candidate-evaluation.ics",
                    cancellationToken: cancellationToken);
            }

            // ── 3. RECORD OUTBOX EVENT FOR RELIABILITY ─────────────────────────────
            var outboxMessage = new OutboxMessage
            {
                EventType = "InterviewScheduled",
                Payload = JsonSerializer.Serialize(new
                {
                    InterviewId = interview.Id,
                    CandidateId = candidate.Id,
                    CandidateEmail = candidate.Email,
                    InterviewerId = interviewer?.Id,
                    InterviewerEmail = interviewer?.Email,
                    Mode = interview.Mode,
                    ScheduledAt = scheduledAt,
                    CreatedAt = DateTime.UtcNow
                }),
                Status = "Processed",
                ProcessedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            db.OutboxMessages.Add(outboxMessage);
            await db.SaveChangesAsync(cancellationToken);
        }

        private static string BuildCandidateEmailHtml(
            string candidateName,
            string candidateCode,
            string vacancyTitle,
            string roundTitle,
            DateTime scheduledAt,
            int durationMinutes,
            bool isOnline,
            string? meetingLink,
            string interviewerName,
            string hrName)
        {
            var dateStr = scheduledAt.ToString("dd MMMM yyyy 'at' hh:mm tt 'IST'");
            var modeBadge = isOnline
                ? "<span style='background:#0284c7;color:#ffffff;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:bold;'>ONLINE VIDEO CALL</span>"
                : "<span style='background:#10b981;color:#ffffff;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:bold;'>FACE-TO-FACE ON-SITE</span>";

            var meetingActionHtml = isOnline && !string.IsNullOrWhiteSpace(meetingLink)
                ? $@"<div style='text-align:center;margin:24px 0;'>
                      <a href='{meetingLink}' style='background:#6366f1;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:13px;font-weight:bold;display:inline-block;'>🚀 Join Video Meeting</a>
                      <p style='color:#64748b;font-size:11px;margin-top:8px;'>Link: <a href='{meetingLink}' style='color:#6366f1;'>{meetingLink}</a></p>
                    </div>"
                : string.Empty;

            return $@"
            <div style='font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;'>
              <div style='background:linear-gradient(135deg,#1e1b4b,#312e81);padding:24px;color:#ffffff;text-align:center;'>
                <h1 style='margin:0;font-size:20px;font-weight:bold;'>STHAPATYA TALENT EXCELLENCE PLATFORM</h1>
                <p style='margin:4px 0 0;font-size:12px;opacity:0.8;'>Candidate Evaluation Portal (SCIPL)</p>
              </div>
              <div style='padding:28px;'>
                <p style='font-size:14px;color:#334155;margin-top:0;'>Dear <strong>{candidateName}</strong>,</p>
                <p style='font-size:13px;color:#475569;line-height:1.6;'>
                  Congratulations! You have been shortlisted for the next evaluation stage for the <strong>{vacancyTitle}</strong> position at Sthapatya Consultants India Pvt. Ltd. (SCIPL).
                </p>
                <div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin:20px 0;'>
                  <table style='width:100%;font-size:12.5px;color:#334155;border-collapse:collapse;'>
                    <tr><td style='padding:6px 0;color:#64748b;width:120px;'>Candidate Code:</td><td><strong style='font-family:monospace;'>{candidateCode}</strong></td></tr>
                    <tr><td style='padding:6px 0;color:#64748b;'>Target Role:</td><td><strong>{vacancyTitle}</strong></td></tr>
                    <tr><td style='padding:6px 0;color:#64748b;'>Round:</td><td><strong>{roundTitle}</strong></td></tr>
                    <tr><td style='padding:6px 0;color:#64748b;'>Date & Time:</td><td><strong>{dateStr} ({durationMinutes} mins)</strong></td></tr>
                    <tr><td style='padding:6px 0;color:#64748b;'>Evaluator:</td><td>{interviewerName}</td></tr>
                    <tr><td style='padding:6px 0;color:#64748b;'>Interview Mode:</td><td>{modeBadge}</td></tr>
                  </table>
                </div>
                {meetingActionHtml}
                <div style='background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px;font-size:11.5px;color:#1e40af;'>
                  📌 <strong>Preparation Instructions:</strong><br/>
                  • Please join 5 minutes prior to the scheduled time.<br/>
                  • An attached .ics calendar invite is included to automatically block your calendar.<br/>
                  • Ensure a quiet environment and working webcam & microphone.
                </div>
                <p style='font-size:12.5px;color:#64748b;margin-top:24px;'>
                  Best Regards,<br/>
                  <strong>{hrName}</strong> | Human Resources Team<br/>
                  Sthapatya Consultants India Pvt. Ltd.
                </p>
              </div>
            </div>";
        }

        private static string BuildInterviewerEmailHtml(
            string interviewerName,
            string candidateName,
            string candidateCode,
            string vacancyTitle,
            string roundTitle,
            decimal experienceYears,
            DateTime scheduledAt,
            int durationMinutes,
            bool isOnline,
            string? meetingLink,
            string scorecardUrl)
        {
            var dateStr = scheduledAt.ToString("dd MMMM yyyy 'at' hh:mm tt 'IST'");
            var expText = experienceYears == 0 ? "Fresher (0 Yrs)" : $"{experienceYears:0.#} Years";
            var modeBadge = isOnline
                ? "<span style='background:#0284c7;color:#ffffff;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:bold;'>ONLINE VIDEO CALL</span>"
                : "<span style='background:#10b981;color:#ffffff;padding:4px 10px;border-radius:12px;font-size:11px;font-weight:bold;'>FACE-TO-FACE ON-SITE</span>";

            var meetingInfo = isOnline && !string.IsNullOrWhiteSpace(meetingLink)
                ? $"<tr><td style='padding:6px 0;color:#64748b;'>Meeting Link:</td><td><a href='{meetingLink}' style='color:#6366f1;'>{meetingLink}</a></td></tr>"
                : string.Empty;

            return $@"
            <div style='font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;'>
              <div style='background:linear-gradient(135deg,#0f172a,#1e293b);padding:24px;color:#ffffff;text-align:center;'>
                <h1 style='margin:0;font-size:18px;font-weight:bold;'>STEP INTERVIEWER EVALUATION BRIEFING</h1>
                <p style='margin:4px 0 0;font-size:12px;opacity:0.8;'>Candidate Assessment Assignment</p>
              </div>
              <div style='padding:28px;'>
                <p style='font-size:14px;color:#334155;margin-top:0;'>Hi <strong>{interviewerName}</strong>,</p>
                <p style='font-size:13px;color:#475569;line-height:1.6;'>
                  Candidate <strong>{candidateName}</strong> ({candidateCode}) has been assigned to you for conducting the <strong>{roundTitle}</strong>.
                </p>
                <div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin:20px 0;'>
                  <table style='width:100%;font-size:12.5px;color:#334155;border-collapse:collapse;'>
                    <tr><td style='padding:6px 0;color:#64748b;width:120px;'>Candidate:</td><td><strong>{candidateName} ({candidateCode})</strong></td></tr>
                    <tr><td style='padding:6px 0;color:#64748b;'>Target Role:</td><td><strong>{vacancyTitle}</strong></td></tr>
                    <tr><td style='padding:6px 0;color:#64748b;'>Experience:</td><td><strong>{expText}</strong></td></tr>
                    <tr><td style='padding:6px 0;color:#64748b;'>Scheduled Time:</td><td><strong>{dateStr} ({durationMinutes} mins)</strong></td></tr>
                    <tr><td style='padding:6px 0;color:#64748b;'>Interview Mode:</td><td>{modeBadge}</td></tr>
                    {meetingInfo}
                  </table>
                </div>
                <div style='text-align:center;margin:24px 0;'>
                  <a href='{scorecardUrl}' style='background:#6366f1;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:13px;font-weight:bold;display:inline-block;'>📋 Open Candidate Scorecard in STEP</a>
                </div>
                <p style='font-size:12px;color:#64748b;'>
                  Please review the candidate's resume and submit your round feedback directly in the STEP portal.
                </p>
              </div>
            </div>";
        }
    }
}
