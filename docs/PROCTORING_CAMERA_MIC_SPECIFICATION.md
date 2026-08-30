# STEP Enterprise Platform — Proctored Exam & AI Audio/Video Surveillance Specification

**Document Version:** 1.0.0  
**Target Module:** Candidate Exam Portal & Proctoring Engine (`CandidateExamPortalV2.tsx`, `ExamsController.cs`, `StepDbContext`)  
**Status:** Architecture Design & Implementation Roadmap  
**Author:** Antigravity AI & STEP Engineering Team  

---

## 1. Executive Summary & Codebase Audit Findings

Based on our comprehensive audit of the STEP codebase, the following foundations already exist:
* **Frontend (`src/features/assessments/components/CandidateExamPortalV2.tsx`)**:
  * Lifecycle state machine: `login` ➔ `instructions` ➔ `active` ➔ `submitted`.
  * Real-time timer and section locks.
  * Tab-switch detection and client violation alerts (`useReportExamViolationMutation`).
* **Backend (`STEP.Domain/Entities/Exam/CandidateExamSessionV2.cs`)**:
  * `AssessmentIntegrityScore` (starts at 100.00%, drops with violations).
  * `TabSwitchWarningCount` (tracks warnings).
  * `ExamProctoringLog` entity in the `examv2` schema (records `EventType`, `Metadata`, `LoggedAt`).
  * `ReportExamViolationCommandHandler.cs` enforces a 3-strike server-side auto-submission rule and 10% penalty per violation.

### What is Missing for Full Audio/Video Proctoring:
1. **Pre-Exam Hardware Diagnostic & Identity Verification Flow**: Device permission checks, audio level visualizer, and baseline candidate face snapshot.
2. **Real-time Camera & Microphone Streams**: Corner Picture-in-Picture (PiP) feed during active test solving.
3. **Automated AI/Client Integrity Detectors**: Periodic snapshot capture, multi-face/no-face detection, and voice activity spikes.
4. **Backend Snapshot Storage & Extended Log Endpoints**: Multi-part snapshot upload API with local/cloud blob storage persistence.
5. **Recruiter Evaluation Proctoring Timeline**: Visual photo grid and incident timestamps in Candidate Profile / Evaluation page.

---

## 2. Database Schema Architecture (`examv2` Schema)

### 2.1 Existing Schema State
```sql
-- Existing Entity: examv2.CandidateExamSessionsV2
-- Columns: Id, SessionToken, CandidateId, VacancyId, AssessmentIntegrityScore, TabSwitchWarningCount, SessionStatus, etc.

-- Existing Entity: examv2.ExamProctoringLogs
-- Columns: Id, CandidateExamSessionId, EventType, ClientIp, UserAgent, Metadata, LoggedAt
```

### 2.2 Schema Enhancements (EF Core Migration)

#### A. New Table: `examv2.ExamProctoringSnapshots`
Stores periodic photos and violation evidence images captured from the webcam:

```csharp
namespace STEP.Domain.Entities.Exam
{
    public class ExamProctoringSnapshot
    {
        public int Id { get; set; }
        public int CandidateExamSessionId { get; set; }
        public CandidateExamSessionV2 CandidateExamSession { get; set; } = null!;

        /// <summary>
        /// Snapshot Type: "BaselineVerification", "PeriodicInterval", "MultiFaceDetected", 
        /// "NoFaceDetected", "AudioSpikeDetected", "TabSwitchTrigger"
        /// </summary>
        public string SnapshotType { get; set; } = "PeriodicInterval";

        /// <summary>Relative storage path or Cloud Blob URL</summary>
        public string ImageUrl { get; set; } = string.Empty;

        /// <summary>Integrity score calculated at the time of snapshot capture</summary>
        public decimal SessionIntegrityScoreAtCapture { get; set; }

        public int WarningCountAtCapture { get; set; }

        /// <summary>JSON metadata: Face bounding boxes, confidence score, detected decibel levels</summary>
        public string? AIAnalyticsJson { get; set; }

        public DateTimeOffset CapturedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
```

#### B. Updated Entity: `examv2.CandidateExamSessionV2`
```csharp
// Add navigation collection to CandidateExamSessionV2.cs:
public ICollection<ExamProctoringSnapshot> ProctoringSnapshots { get; set; } = new List<ExamProctoringSnapshot>();

// Add verification metadata:
public string? InitialVerificationPhotoUrl { get; set; }
public bool HardwareAudioVerified { get; set; }
public bool HardwareVideoVerified { get; set; }
```

---

## 3. Backend API Specifications

### 3.1 Upload Proctoring Snapshot / Violation Evidence
* **Endpoint:** `POST /api/exams/session/proctoring-snapshot`
* **Content-Type:** `multipart/form-data`
* **Request Payload:**
  * `sessionToken` (string)
  * `snapshotType` (string: `PeriodicInterval` | `MultiFaceDetected` | `NoFaceDetected` | `AudioSpike`)
  * `imageFile` (IFormFile: JPEG/WebP compressed frame)
  * `analyticsJson` (string: `{ "facesCount": 2, "audioDb": 68.4 }`)
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "snapshotId": 482,
    "warningCount": 2,
    "currentIntegrityScore": 80.00,
    "shouldAutoSubmit": false
  }
  ```

### 3.2 Pre-Exam Verification Checkin
* **Endpoint:** `POST /api/exams/session/verify-hardware`
* **Request Payload:**
  * `sessionToken` (string)
  * `verificationPhoto` (IFormFile)
  * `hasCamera`: true
  * `hasMicrophone`: true
* **Action:** Saves `InitialVerificationPhotoUrl` and marks `SessionStatus = "Ready"`.

### 3.3 Get Proctoring Session Audit Report (For Evaluator/Recruiter)
* **Endpoint:** `GET /api/exams/session/{id}/proctoring-audit`
* **Response (200 OK):**
  ```json
  {
    "sessionId": 12,
    "candidateName": "Aarav Sharma",
    "finalIntegrityScore": 90.00,
    "tabSwitchCount": 1,
    "totalSnapshots": 18,
    "baselinePhotoUrl": "/uploads/proctoring/session_12/baseline.webp",
    "timeline": [
      {
        "time": "2026-08-30T10:00:00Z",
        "type": "BaselineVerification",
        "imageUrl": "/uploads/proctoring/session_12/snap_0.webp",
        "flagged": false
      },
      {
        "time": "2026-08-30T10:14:22Z",
        "type": "TabSwitch",
        "flagged": true,
        "metadata": { "durationSeconds": 4 }
      },
      {
        "time": "2026-08-30T10:25:00Z",
        "type": "MultiFaceDetected",
        "imageUrl": "/uploads/proctoring/session_12/snap_14.webp",
        "flagged": true,
        "metadata": { "facesCount": 2 }
      }
    ]
  }
  ```

---

## 4. Frontend Architecture & Components (`frontend/src/features/assessments/`)

```
frontend/src/features/assessments/
├── components/
│   ├── CandidateExamPortalV2.tsx        # Main Exam Orchestrator
│   ├── proctoring/
│   │   ├── HardwarePrecheckModal.tsx    # 30-sec Camera/Mic permission & baseline snap
│   │   ├── LiveProctoringFeed.tsx       # Floating Corner PiP video + mic status dot
│   │   ├── AudioLevelMeter.tsx          # Real-time microphone VU level indicator
│   │   └── ProctoringIncidentToast.tsx  # Warning banners (e.g. "Looking away detected")
│   └── review/
│       └── ProctoringAuditGallery.tsx   # Recruiter view: photo timeline & audit events
├── hooks/
│   ├── useWebcamStream.ts               # WebRTC getUserMedia lifecycle & canvas capture
│   ├── useAudioMonitor.ts               # Web Audio API VAD (Voice Activity Detection)
│   └── useProctoringEngine.ts           # Timer-based snapshot dispatcher & anti-cheat engine
```

### 4.1 Step 1: Hardware Pre-Check Modal (`HardwarePrecheckModal.tsx`)
1. Prompts for `navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true })`.
2. Displays live video preview and an active audio volume visualizer.
3. Candidate clicks **"📸 Capture Identity Snapshot"**.
4. Uploads verification photo to `/api/exams/session/verify-hardware`.
5. Unlocks the **"Start Assessment"** button.

### 4.2 Step 2: Live PiP Video Feed (`LiveProctoringFeed.tsx`)
* Floating in the bottom-left corner (`fixed bottom-4 left-4 z-40`).
* Compact 140x105px video frame with smooth rounded corners, glassmorphism border, and live pulse dot (`● Live Proctoring Active`).
* Minimizable / draggable to ensure it never obstructs code editors or question text.

### 4.3 Step 3: Anti-Cheat & Periodic Snapshot Scheduler (`useProctoringEngine.ts`)
* **Interval Snapshots:** Every 90 seconds, draws current video frame to an offscreen `<canvas>`, compresses to WebP (~20-40KB), and posts to `/api/exams/session/proctoring-snapshot`.
* **Audio Voice Activity Trigger:** If continuous sound above 65dB is detected for >3 seconds (using Web Audio `AnalyserNode`), dispatches an `AudioSpike` snapshot.
* **Visibility & Window Blur:** Listens to `document.onvisibilitychange` and `window.onblur` to capture instant frames when candidates switch tabs.

---

## 5. Security, Privacy & Performance Safeguards

1. **Client-Side Image Compression:** Canvas compresses frames to WebP at 0.6 quality (average payload < 30KB) to ensure zero lag on standard internet connections.
2. **Stream Privacy & Destruction:** Video and Audio tracks are immediately stopped via `stream.getTracks().forEach(t => t.stop())` when the exam is submitted or timed out.
3. **Data Retention & Encryption:** Snapshots are stored in secured file storage with session-hashed folder paths and purged automatically per enterprise data retention policies.

---

## 6. Implementation Roadmap

| Phase | Task Description | Files Touched |
| :--- | :--- | :--- |
| **Phase 1: DB & API** | Create `ExamProctoringSnapshot` entity, EF Core migration, and snapshot upload handler | `CandidateExamSessionV2.cs`, `StepDbContext.cs`, `ExamsController.cs` |
| **Phase 2: Pre-Check UI** | Build `HardwarePrecheckModal.tsx` & `useWebcamStream.ts` for camera/mic permissions & baseline snap | `src/features/assessments/components/proctoring/` |
| **Phase 3: Live Proctoring** | Build `LiveProctoringFeed.tsx` PiP widget & periodic background snapshot engine | `CandidateExamPortalV2.tsx`, `useProctoringEngine.ts` |
| **Phase 4: Admin Audit** | Add Proctoring Timeline Gallery in Candidate Evaluation view | `CandidateProfilePage.tsx`, `CandidateEvaluationView.tsx` |

---

*This document serves as the permanent single source of truth for the STEP Proctoring Engine.*
