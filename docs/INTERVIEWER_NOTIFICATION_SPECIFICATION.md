# STEP Enterprise Platform — Interview Notification, Email Dispatch & Teams Bridge Specification

**Document:** `docs/INTERVIEWER_NOTIFICATION_SPECIFICATION.md`  
**Target Module:** Interview Scheduling & Evaluator Assignment (`ScheduleInterviewCommandHandler.cs`, `EmailService.cs`, `CandidateProfilePage.tsx`)  
**Default Sender:** `Recruitment@sthapatya.in`  
**Multi-Address Support:** Dynamic `SenderEmail`, `DefaultCc`, `DefaultBcc`, and per-request `Reply-To`  
**Status:** Architectural Specification & Implementation Roadmap  
**Database Changes Required:** **NONE (0 Schema / 0 Table Changes)**  
**Author:** Antigravity AI & STEP Engineering Team

---

## 1. Executive Summary

When an interview is scheduled (either **Face-to-Face** or **Online**):

1. **Candidate Notification**: A formal branded email invitation is automatically dispatched to the candidate (`candidate.Email`) with date/time, round details, meeting link (if Online), and attached `.ics` calendar file.
2. **Interviewer Notification**: A briefing email is dispatched to the assigned interviewer (`interviewer.Email`) with candidate credentials, resume link, and 1-click scorecard link.
3. **1-Click Teams Direct Chat**: A direct Teams chat link (`https://teams.microsoft.com/l/chat/...`) is generated for HR to ping the interviewer on Microsoft Teams with 1 click.
4. **Single Source of Truth Configuration**: All outbound emails use `Recruitment@sthapatya.in` configured dynamically in one central place (`appsettings.json`).
5. **CC / BCC Multi-Address Support**: Allows adding secondary HR/audit email addresses to CC or BCC automatically on all dispatches.

---

## 2. Centralized Dynamic Email Configuration (`appsettings.json`)

To change the sender email, CC, or BCC in the future, you only edit **one single file** (`appsettings.json`):

```json
{
	"EmailSettings": {
		"SenderEmail": "Recruitment@sthapatya.in",
		"SenderDisplayName": "STEP Recruitment Team",
		"DefaultCc": "",
		"DefaultBcc": "",
		"SmtpHost": "smtp.office365.com",
		"SmtpPort": 587,
		"EnableSsl": true,
		"Username": "Recruitment@sthapatya.in",
		"Password": "<APP_PASSWORD>"
	}
}
```

- **Dynamic Change**: Changing `SenderEmail` in `appsettings.json` automatically updates every outbound email across the entire application instantly without recompiling code.
- **Secondary Addresses (CC / BCC)**: If you provide an address in `DefaultCc` (e.g. `hr.leads@sthapatya.in`) or `DefaultBcc` (e.g. `archive@sthapatya.in`), every interview invitation and notification automatically copies those addresses.

---

## 3. Communication Matrix

| Recipient           | Channel                 | Email Address Used         | Purpose                                                |
| :------------------ | :---------------------- | :------------------------- | :----------------------------------------------------- |
| **Candidate**       | Email (`.ics` attached) | `candidate.Email`          | Formal interview invitation & video link (if Online)   |
| **Interviewer**     | Email + Teams Chat      | `interviewer.Email`        | Assignment alert & direct STEP scorecard link          |
| **HR Recruiter**    | Email `Reply-To`        | Logged-in `User.Email`     | Direct candidate replies land in the recruiter's inbox |
| **Audit / HR Lead** | Email (CC / BCC)        | `DefaultCc` / `DefaultBcc` | Organization tracking & archival                       |

---

## 4. Message Templates (Mode-Aware)

### 4.1 Candidate Email Invitation (Face-to-Face vs Online)

- **Sender**: `Recruitment@sthapatya.in` (via `STEP Recruitment Team`)
- **Reply-To**: Current HR Recruiter email
- **Subject**: `[STEP Interview] Invitation: {RoundTitle} — Sthapatya Consultants (SCIPL)`
- **Content**:
  - Branded HTML layout
  - Candidate Name (`{CandidateName}`) & Code (`{CandidateCode}`)
  - Target Role (`{VacancyTitle}`) & Round Name (`{RoundTitle}`)
  - Scheduled Date, Time & Duration
  - If `Mode == "Online"`: Prominent **`[ 🚀 Join Video Meeting ]`** button with the meeting link.
  - If `Mode == "Face-to-Face"`: On-site evaluation confirmation.
  - Attached `.ics` calendar invitation.

---

### 4.2 Interviewer Email Briefing

- **Sender**: `Recruitment@sthapatya.in` (via `STEP Recruitment Team`)
- **Recipient**: `interviewer.Email`
- **CC / BCC**: `DefaultCc` / `DefaultBcc`
- **Subject**: `[STEP Evaluation Briefing] Candidate Assigned: {CandidateName} ({CandidateCode}) — {RoundTitle}`
- **Content**:
  - Formal on-site or online assignment alert
  - Candidate summary: Name (`{CandidateName}`), Code (`{CandidateCode}`), Role (`{VacancyTitle}`), Experience (`{ExperienceYears} Yrs`)
  - Scheduled Date, Time & Mode (`Face-to-Face` or `Online` with meeting link)
  - Direct Action CTA: **`[ 📋 Open Candidate Scorecard in STEP ]`**
  - Attached `.ics` calendar invitation (syncs to interviewer's Outlook and Teams calendar).

---

### 4.3 1-Click Microsoft Teams Direct Chat (HR ➔ Interviewer)

- **Teams Protocol URL**: `https://teams.microsoft.com/l/chat/0/0?users={interviewerEmail}&message={encodedBriefing}`
- **Briefing Content**:

  ```text
  👋 Hi {InterviewerFirstName},

  Candidate {CandidateName} ({CandidateCode}) has been assigned to you for a {Mode} {RoundTitle}.

  💼 Role: {VacancyTitle}
  ⏱️ Experience: {ExperienceYears} Yrs
  {If Online: 🎥 Meeting Link: {MeetingLink}}

  🔗 Candidate Profile & Evaluation Scorecard:
  {AppBaseUrl}/dashboard/candidates/{CandidateId}

  Please review their profile and conduct the evaluation in STEP.
  ```

---

## 5. Database Audit & Schema Verification (0 DB Changes Required)

| Entity / Table                | Column Used                         | Purpose                               | Status      |
| :---------------------------- | :---------------------------------- | :------------------------------------ | :---------- |
| `interview.Interviews`        | `Mode`                              | Stores `"Face-to-Face"` or `"Online"` | ✅ Existing |
| `interview.Interviews`        | `MeetingLinkOrLocation`             | Stores meeting URL or on-site room    | ✅ Existing |
| `interview.Interviews`        | `InterviewerUserId`                 | Assigned interviewer foreign key      | ✅ Existing |
| `identity.Users`              | `Email`, `FirstName`, `LastName`    | Interviewer & HR email addresses      | ✅ Existing |
| `candidate.Candidates`        | `Email`, `CandidateCode`, `Name`    | Candidate credentials                 | ✅ Existing |
| `notification.OutboxMessages` | `EventType`, `Payload`, `CreatedAt` | Transactional outbox queue            | ✅ Existing |

---

## 6. Implementation Checklist

1. **`EmailSettings.cs`**: Configuration model with `SenderEmail`, `DefaultCc`, `DefaultBcc`, SMTP details.
2. **`EmailService.cs`**: Robust HTML mail builder supporting To, CC, BCC, Reply-To, and `.ics` attachments.
3. **`ScheduleInterviewCommandHandler.cs`**: Auto-triggers candidate & interviewer notification dispatches.
4. **`CandidateProfilePage.tsx`**: Renders Meeting Link input when `Online` is selected + **"💬 Ping on Teams"** button upon assignment.
