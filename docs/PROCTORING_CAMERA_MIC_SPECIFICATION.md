# STEP Enterprise Platform — Proctored Exam & AI Audio/Video Surveillance Specification

**Document Version:** 1.0.0  
**Target Module:** Candidate Exam Portal & Proctoring Engine (`CandidateExamPortalV2.tsx`, `ExamsController.cs`, `StepDbContext`)  
**Status:** Architecture Design & Implementation Roadmap  
**Author:** Antigravity AI & STEP Engineering Team

---

## 1. Executive Summary & Codebase Audit Findings

Based on our comprehensive audit of the STEP codebase, the following foundations already exist:

- **Frontend (`src/features/assessments/components/CandidateExamPortalV2.tsx`)**:
  - Lifecycle state machine: `login` ➔ `instructions` ➔ `active` ➔ `submitted`.
  - Real-time timer and section locks.
  - Tab-switch detection and client violation alerts (`useReportExamViolationMutation`).
- **Backend (`STEP.Domain/Entities/Exam/CandidateExamSessionV2.cs`)**:
  - `AssessmentIntegrityScore` (starts at 100.00%, drops with violations).
  - `TabSwitchWarningCount` (tracks warnings).
  - `ExamProctoringLog` entity in the `examv2` schema (records `EventType`, `Metadata`, `LoggedAt`).
  - `ReportExamViolationCommandHandler.cs` enforces a 3-strike server-side auto-submission rule and 10% penalty per violation.

### What is Missing for Full Audio/Video Proctoring:

1. **Pre-Exam Hardware Diagnostic & Identity Verification Flow**: Device permission checks, audio level visualizer, and baseline candidate face snapshot.
2. **Real-time Camera & Microphone Streams**: Corner Picture-in-Picture (PiP) feed during active test solving.
3. **Automated AI/Client Integrity Detectors**: Periodic snapshot capture, multi-face/no-face detection, and voice activity spikes.
4. **Backend Snapshot Storage & Extended Log Endpoints**: Multi-part snapshot upload API with local/cloud blob storage persistence.
5. **Recruiter Evaluation Proctoring Timeline**: Visual photo grid and incident timestamps in Candidate Profile / Evaluation page.

---

## 2. Database Schema Architecture (`examv2` Schema)

## 2. Backend Enhancements (Event Logging Only)

Since we are strictly relying on AI evaluation and **not saving images**, we only need to log proctoring _events_ (violations) rather than binary photo blobs.

### 2.1 Updated Entity: `examv2.ExamProctoringLogs`

We will expand the existing `ExamProctoringLogs` table to store AI violation metadata.

```csharp
namespace STEP.Domain.Entities.Exam
{
    public class ExamProctoringLog
    {
        public int Id { get; set; }
        public int CandidateExamSessionId { get; set; }
        public CandidateExamSessionV2 CandidateExamSession { get; set; } = null!;

        /// <summary>
        /// "TabSwitch", "MultipleFacesDetected", "NoFaceDetected", "AudioSpike", "LookingAway"
        /// </summary>
        public string EventType { get; set; } = string.Empty;

        /// <summary>The calculated Integrity Score penalty applied for this violation</summary>
        public decimal PenaltyApplied { get; set; }

        /// <summary>JSON metadata (e.g. { "facesCount": 2, "confidence": 0.98 })</summary>
        public string? MetadataJson { get; set; }

        public DateTimeOffset LoggedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
```

---

## 3. Frontend Architecture (Client-Side AI)

Instead of uploading images, the frontend will run lightweight AI models in the browser using **MediaPipe Face Detection** or **TensorFlow.js (BlazeFace)**.

### 3.1 Step 1: Hardware Pre-Check Modal (`HardwarePrecheckModal.tsx`)

1. Prompts for `navigator.mediaDevices.getUserMedia({ video: true, audio: true })`.
2. Verifies that the camera and microphone are accessible.
3. Loads the AI model and ensures exactly **one face** is detected before allowing the candidate to start the exam.

### 3.2 Step 2: Live PiP Video & Anti-Cheat Engine (`useProctoringEngine.ts`)

- **Face Detection (MediaPipe/TF.js):** Analyzes the `<video>` stream in real-time (e.g., every 2 seconds).
  - **Violation - No Face:** If 0 faces are detected for >5 seconds (Candidate left the seat).
  - **Violation - Multiple Faces:** If >1 face is detected (Someone is helping them).
- **Audio Voice Activity (Web Audio API):** Analyzes microphone input.
  - **Violation - Audio Spike:** If continuous talking/sound above 65dB is detected.
- **Browser Integrity:**
  - **Violation - Tab Switch:** Listens to `document.visibilitychange` to detect if they opened another tab or ChatGPT.

### 3.3 Step 3: API Reporting

When the client-side AI detects a violation, it immediately fires an API request to the backend to log the event and deduct from the candidate's `AssessmentIntegrityScore`.

- **Endpoint:** `POST /api/exams/session/proctoring-event`
- **Request Payload:**
  ```json
  {
  	"sessionToken": "abc-123",
  	"eventType": "MultipleFacesDetected",
  	"metadata": { "facesCount": 2 }
  }
  ```

---

## 4. Admin Audit UI (`CandidateEvaluationView.tsx`)

Recruiters and evaluators will simply see a **Timeline of Violations** and an **Overall Trust Score**, without having to review any photos.

- **Integrity Score:** 75 / 100
- **Violations:**
  - 🔴 10:15 AM - Multiple Faces Detected (Penalty: -10)
  - 🔴 10:22 AM - Switched Browser Tabs (Penalty: -15)
  - 🔴 10:45 AM - Audio Spike / Talking Detected (Penalty: -0)

---

_This document serves as the permanent single source of truth for the STEP Proctoring Engine._
