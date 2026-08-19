# STEP Enterprise ATS — V2 Complete Backend Requirements Contract

> **Document Status**: AUTHORITATIVE LIVING CONTRACT  
> **Last Updated**: 2026-08-18  
> **Purpose**: When backend development begins, this document is the ONLY reference needed. It documents every API endpoint, DTO, database schema, stored procedure, validation rule, design decision, and architectural constraint derived from the current frontend implementation.

---

## 0. Base URL & API Routing Architecture

### URL Pattern
```
V1 APIs:  {BASE_URL}/api/v1/{route}   →  e.g. https://api.step.com/api/v1/vacancies
V2 APIs:  {BASE_URL}/api/v2/{route}   →  e.g. https://api.step.com/api/v2/assessment-templates
```

### Frontend Environment Variable
```
NEXT_PUBLIC_API_BASE_URL = https://api.step.com/api/v1
```

### V2 Routing Logic (from `baseApi.ts`)
Any request URL starting with `/v2/` automatically strips the `/v1` suffix from the base URL:
```
/api/v1 → /api  then  /v2/... is appended
Result:  /api/v2/...
```

### Auth Header
All authenticated requests include:
```
Authorization: Bearer {accessToken}
```
Token stored in `localStorage` as `step_token`.

### Standard API Response Envelope
ALL endpoints return this wrapper:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": { ... },
  "errors": null,
  "meta": {
    "pageIndex": 1,
    "pageSize": 20,
    "totalCount": 150,
    "totalPages": 8
  },
  "correlationId": "uuid-v4"
}
```
- `meta` is only present on paginated list responses, otherwise `null`.
- `data` is typed per endpoint.
- On error: `success: false`, `errors: string[]`.

---

## 1. RBAC — 3 Platform Roles

| Role | Level | Key Capabilities |
|---|---|---|
| **`HR`** | Full Platform | Vacancies, Candidates, Assessment Templates, Question Bank, Interviews, Offers, Master Data, Users |
| **`Director`** | Full Platform + Executive | Everything HR can do + Director PIN login, Offer approvals, Salary overrides, Audit logs |
| **`Interviewer`** | Scoped Evaluator | View assigned candidates, evaluate Round 2 & Round 3, submit scorecards |

### Permission Matrix

| Feature | HR | Director | Interviewer |
|---|:---:|:---:|:---:|
| 1-Click Instant Drive (V2) | ✅ | ✅ | ❌ |
| Assessment Templates CRUD | ✅ | ✅ | 👁️ Read |
| Question Bank CRUD + Import | ✅ | ✅ | 👁️ Read |
| Vacancies (CRUD + Pipeline) | ✅ | ✅ | 👁️ |
| Candidate Management | ✅ | ✅ | 👁️ Assigned |
| Assessment Results View | ✅ | ✅ | ✅ Assigned |
| Interview Evaluation & Scoring | ✅ | ✅ | ✅ Score/Feedback |
| Offer Letter Generation | ✅ Create | ✅ Full + PIN Approve | ❌ |
| Master Data CRUD | ✅ | ✅ | ❌ |
| User Directory & Passwords | ✅ | ✅ | ❌ |

---

## 2. Database Identity Strategy

- **All PKs**: `INT IDENTITY(1,1)` — SQL Server auto-increment
- **Rule**: Frontend NEVER generates persistent entity IDs
- **Create flow**: POST body omits `id` → DB generates → response returns new `id` → frontend stores it
- **All timestamps**: `DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()`

---

## 3. Key V2 Design Decisions (READ FIRST)

| Decision | Detail |
|---|---|
| **No Role-Tier Matrix** | Removed. Template is selected per vacancy at vacancy creation time by HR. No pre-mapping. |
| **No Difficulty Tags** | Removed. Questions are tagged by `ExperienceTier` (from `master.ExperienceLevels`). Sampler filters by candidate's tier. |
| **No Aptitude Section Type** | `sectionType = 'Aptitude'` is invalid in V2. Use `TechnicalMCQ` for all MCQ-format sections. |
| **Shuffle Always On** | `EnableQuestionShuffling` and `EnableOptionShuffling` are platform invariants = always `1`. SP enforces this; client cannot change it. |
| **ExperienceTier from Master** | `master.ExperienceLevels` drives both question tagging AND candidate tier resolution at exam session creation. |
| **Templates are Universal** | Templates are not tied to specific roles or tiers. They define structure only. HR picks the right template per vacancy contextually. |
| **No Template Description** | `Description` field removed — reduces form complexity. |
| **Template selected at vacancy creation** | `Vacancies.AssessmentBlueprintId FK` stores which template applies. Multiple vacancies can use the same template. |
| **2 Template Categories** | MCQ-Only (non-IT roles: 20 MCQ) and Full Technical Track (IT roles: 20 MCQ + 5 Coding/SQL + 3 Subjective). SQL variant replaces Coding with SQL sandbox. |

---

## 4. Complete API Endpoint Catalog

---

### 4A. Auth APIs (`/api/v1/auth/...`)

| Method | Route | Body | Response | Auth |
|---|---|---|---|---|
| `POST` | `/auth/login` | `{ email, password }` | `AuthResultData` | Public |
| `POST` | `/auth/director-pin-login` | `{ pin }` | `AuthResultData` | Public |
| `POST` | `/auth/refresh-token` | `{ refreshToken }` | `AuthResultData` | Public |

**`AuthResultData`**:
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresAtUtc": "2026-08-19T00:00:00Z",
  "user": {
    "id": 1,
    "employeeCode": "EMP-001",
    "firstName": "Aditya",
    "lastName": "Bhange",
    "email": "aditya@step.com",
    "role": "HR",
    "permissions": ["candidates.read", "vacancies.write"]
  }
}
```

**Frontend token storage** (localStorage keys):
- `step_token` — access token
- `step_refresh_token` — refresh token
- `step_email` — logged-in email
- `step_role` — `HR` / `Director` / `Interviewer`
- `step_name` — full name
- `step_emp_code` — employee code
- `step_user_id` — user ID string

**Auto-refresh behaviour**: On `401`, frontend automatically calls `/auth/refresh-token` with stored refresh token, then retries original request. On refresh failure, clears tokens and redirects to `/`.

---

### 4B. User Management APIs (`/api/v1/users/...`)

| Method | Route | Body | Response | Auth |
|---|---|---|---|---|
| `GET` | `/users` | — | `UserItem[]` | HR, Director |
| `POST` | `/users` | `CreateUserRequest` | `UserItem` | HR, Director |
| `PUT` | `/users/{id}` | `UpdateUserRequest` | `UserItem` | HR, Director |
| `POST` | `/users/change-password` | `ChangePasswordRequest` | `{ success }` | All (self only) |
| `POST` | `/users/change-pin` | `ChangePinRequest` | `{ success }` | Director (self only) |

**`UserItem`**:
```json
{
  "id": 1,
  "employeeCode": "EMP-001",
  "firstName": "Aditya",
  "lastName": "Bhange",
  "email": "aditya@step.com",
  "role": "HR",
  "department": "Engineering",
  "status": "Active"
}
```

---

### 4C. Master Data APIs (`/api/v1/masterdata/...`)

Single generic CRUD endpoint supports all taxonomy categories.

| Method | Route | Body | Response | Auth |
|---|---|---|---|---|
| `GET` | `/masterdata/{category}` | — | `MasterRecord[]` | All |
| `POST` | `/masterdata/{category}` | `{ name, code, description?, isActive? }` | `MasterRecord` | HR, Director |
| `PUT` | `/masterdata/{category}/{id}` | `{ name, code, description?, isActive }` | `MasterRecord` | HR, Director |
| `DELETE` | `/masterdata/{category}/{id}` | — | `boolean` | HR, Director |
| `PATCH` | `/masterdata/{category}/{id}/toggle-status` | — | `MasterRecord` | HR, Director |

**Active V2 Categories** (used in frontend Settings page):

| `{category}` | Table | Purpose |
|---|---|---|
| `roles` | `master.MasterRoles` | Enterprise job role definitions |
| `departments` | `master.Departments` | Business units |
| `employmenttypes` | `master.EmploymentTypes` | Full-Time, Contract, Internship |
| `hiringlocations` | `master.HiringLocations` | Office locations |
| `languages` | `master.ProgrammingLanguages` | Assessment language domains for question tagging + IDE runtime |
| `experiencelevels` | `master.ExperienceLevels` | **V2 Active** — Experience tiers for question tagging AND exam session resolution |

**Legacy V1 Categories** (still accessible but superseded):

| `{category}` | Reason Legacy |
|---|---|
| `testlocations` | Replaced by digital QR codes and online/walk-in drives |

**`MasterRecord`**:
```json
{
  "id": "1",
  "category": "roles",
  "code": "FSRN",
  "name": "Full Stack React & Node Developer",
  "description": "...",
  "displayOrder": 1,
  "isActive": true
}
```

**DB Schema for all master tables** (shared pattern):
```sql
CREATE TABLE master.{TableName} (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(150) NOT NULL,
    Description NVARCHAR(500) NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
```

**`master.ExperienceLevels`** has additional fields:
```sql
CREATE TABLE master.ExperienceLevels (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,   -- 'FRESH', 'JR', 'MID', 'SR', 'LEAD'
    Name NVARCHAR(100) NOT NULL,          -- 'Fresher', 'Junior', 'Mid-Level', 'Senior', 'Lead'
    MinYears DECIMAL(4,1) NOT NULL DEFAULT 0.0,
    MaxYears DECIMAL(4,1) NOT NULL DEFAULT 1.0,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
```

**Seed data for ExperienceLevels** (must match frontend expectations exactly):
| Code | Name | MinYears | MaxYears |
|---|---|---|---|
| `FRESH` | `Fresher` | 0.0 | 1.0 |
| `JR` | `Junior` | 1.0 | 3.0 |
| `MID` | `Mid-Level` | 3.0 | 5.0 |
| `SR` | `Senior` | 5.0 | 8.0 |
| `LEAD` | `Lead` | 8.0 | 99.0 |

---

### 4D. Vacancy & Pipeline APIs (`/api/v1/vacancies/...` and `/api/v1/pipelineflows/...`)

| Method | Route | Body / Params | Response | Auth |
|---|---|---|---|---|
| `GET` | `/vacancies` | `?status&search&departmentId&pageSize&pageIndex` | `VacancyItem[]` + meta | HR, Director |
| `GET` | `/vacancies/{id}` | — | `VacancyDetailData` | HR, Director, Interviewer |
| `POST` | `/vacancies` | `CreateVacancyRequest` | `VacancyDetailData` | HR, Director |
| `PUT` | `/vacancies/{id}` | `UpdateVacancyRequest` | `VacancyDetailData` | HR, Director |
| `POST` | `/pipelineflows` | `CreatePipelineFlowRequest` | `PipelineFlowData` | HR, Director |
| `PUT` | `/pipelineflows/{id}` | `UpdatePipelineFlowRequest` | `PipelineFlowData` | HR, Director |
| `DELETE` | `/pipelineflows/{id}` | — | `boolean` | HR, Director |
| `POST` | `/pipelineflows/rounds/{roundId}/assign-question-paper` | `{ vacancyQuestionPaperId }` | `RoundData` | HR, Director |

**V2 Addition on Vacancies**: `AssessmentBlueprintId` FK field (see FEAT-V2-03).

---

### 4E. Candidate APIs (`/api/v1/candidates/...`)

| Method | Route | Body / Params | Response | Auth |
|---|---|---|---|---|
| `GET` | `/candidates` | `?vacancyId&status&search&pageIndex&pageSize` | `CandidateItem[]` + meta | HR, Director |
| `GET` | `/candidates/{id}` | — | `CandidateDetailData` | HR, Director, Interviewer |
| `POST` | `/candidates` | `RegisterCandidateRequest` | `CandidateDetailData` | HR, Director |
| `PUT` | `/candidates/{id}` | `UpdateCandidateRequest` | `CandidateDetailData` | HR, Director |
| `POST` | `/candidates/{id}/assign-flow` | `{ flowTemplateId / vacancyPipelineFlowId }` | `{ assigned }` | HR, Director |
| `POST` | `/candidates/{id}/assign-evaluator` | `{ roundNumber, evaluatorUserId }` | `{ assigned }` | HR, Director |
| `POST` | `/candidates/{id}/documents` | `multipart/form-data: file, documentType?` | `DocumentData` | HR, Director |
| `DELETE` | `/candidates/{id}/documents/{documentId}` | — | `boolean` | HR, Director |
| `POST` | `/candidates/{id}/schedule-test` | `{ testDate, roundNumber?, venueOrLink?, testMode? }` | `{ scheduled }` | HR, Director |
| `POST` | `/candidates/{id}/evaluate-stage` | `{ roundNumber, passed, remarks? }` | `{ evaluated }` | HR, Director |

---

### 4F. Assessment / Exam APIs (`/api/v1/exams/...`)

| Method | Route | Body / Params | Response | Auth |
|---|---|---|---|---|
| `POST` | `/exams/start` | `{ candidateCode, passcode, testSource? }` | `LiveExamWorkspaceData` | Public (candidate) |
| `POST` | `/exams/{sessionToken}/start` | `{ candidateCode?, passcode?, testSource? }` | `LiveExamWorkspaceData` | Public (candidate) |
| `GET` | `/exams/{sessionToken}/resume` | — | `LiveExamWorkspaceData` | Public (candidate) |
| `POST` | `/exams/{sessionToken}/save-answer` | `{ questionId, submittedAnswerText?, selectedOptionIds? }` | `{ saved: boolean }` | Public (candidate) |
| `POST` | `/exams/{sessionToken}/submit` | `{ reason? }` | `SubmitExamResultData` | Public (candidate) |
| `POST` | `/exams/{sessionToken}/violation` | `{ violationType, metadata? }` | `ReportExamViolationResultData` | Public (candidate) |
| `GET` | `/exams/{sessionId}/evaluation` | — | `ExamEvaluationViewData` | HR, Director, Interviewer |
| `POST` | `/exams/{sessionId}/evaluation/answers/{answerId}` | `{ marksObtained, evaluatorRemarks? }` | `{ evaluated }` | HR, Director, Interviewer |
| `POST` | `/exams/{sessionId}/publish` | `{ remarks? }` | `PublishResultData` | HR, Director |

**`LiveExamWorkspaceData`** (sent to candidate portal):
```json
{
  "sessionToken": "ses_abc123",
  "candidateName": "Aditya Bhange",
  "vacancyTitle": "Full Stack React Developer",
  "paperTitle": "Software Engineering Technical Track",
  "durationMinutes": 85,
  "totalTimeLeftSeconds": 5100,
  "activeQuestionIndex": 0,
  "sessionStatus": "InProgress",
  "questions": [
    {
      "id": 501,
      "displayOrder": 1,
      "questionType": "SINGLE_CHOICE",
      "questionText": "What is the primary benefit of useCallback in React?",
      "marks": 1.0,
      "timeAllowedMinutes": null,
      "programmingLanguage": "JavaScript / React",
      "sqlSchema": null,
      "maxWordCount": null,
      "options": [
        { "id": 1201, "label": "A", "text": "Memoizes callback instances between renders" },
        { "id": 1202, "label": "B", "text": "Executes side effects after painting" }
      ],
      "submittedAnswerText": null,
      "selectedOptionIds": []
    }
  ]
}
```

**`SubmitExamResultData`**:
```json
{
  "sessionStatus": "Submitted",
  "totalScore": 18.5,
  "totalMarks": 28.0,
  "pendingManualEvaluationCount": 3
}
```

**`ReportExamViolationResultData`**:
```json
{
  "tabSwitchWarnings": 2,
  "assessmentIntegrityScore": 85,
  "autoSubmitted": false,
  "submitResult": null
}
```

**`ExamEvaluationViewData`** (for HR/Interviewer scorecard view):
```json
{
  "candidateExamSessionId": 89,
  "candidateName": "Aditya Bhange",
  "vacancyTitle": "Full Stack React Developer",
  "paperTitle": "Software Engineering Technical Track",
  "sessionStatus": "Submitted",
  "evaluationStatus": "PendingManualEvaluation",
  "totalMarks": 60.0,
  "totalScore": 32.0,
  "frozenTotalDurationMinutes": 85,
  "startedAt": "2026-08-18T09:00:00Z",
  "submittedAt": "2026-08-18T10:25:00Z",
  "tabSwitchWarnings": 1,
  "assessmentIntegrityScore": 92,
  "answers": [
    {
      "candidateExamAnswerId": 1001,
      "questionDisplayOrder": 1,
      "questionType": "SINGLE_CHOICE",
      "questionText": "What is the primary benefit of useCallback in React?",
      "submittedAnswerText": null,
      "marks": 1.0,
      "marksObtained": 1.0,
      "evaluationStatus": "AutoGraded",
      "evaluationLocked": true,
      "evaluatorRemarks": null,
      "options": [
        { "id": 1201, "label": "A", "text": "Memoizes callback instances between renders", "isCorrect": true }
      ],
      "selectedOptionIds": [1201]
    }
  ]
}
```

**`PublishResultData`**:
```json
{
  "candidateExamSessionId": 89,
  "resultStatus": "Pass",
  "totalScore": 42.0,
  "totalMarks": 60.0,
  "percentage": 70.0,
  "advancedToNextRound": true,
  "nextRoundTitle": "Technical Interview (Round 2)",
  "nextRoundExamPasscode": null,
  "candidateStatus": "R2_Pending"
}
```

---

### 4G. Interview APIs (`/api/v1/interviews/...`)

| Method | Route | Body | Response | Auth |
|---|---|---|---|---|
| `GET` | `/interviews/{id}` | — | `InterviewData` | HR, Director, Interviewer |
| `POST` | `/interviews/schedule` | `ScheduleInterviewRequest` | `InterviewData` | HR, Director |
| `POST` | `/interviews/feedback` | `SubmitInterviewFeedbackRequest` | `{ submitted }` | HR, Director, Interviewer |
| `POST` | `/interviews/{id}/publish` | `{ passed, remarks? }` | `{ published }` | HR, Director |

**`ScheduleInterviewRequest`**:
```json
{
  "candidateId": 42,
  "interviewerUserId": 7,
  "scheduledAt": "2026-08-20T10:00:00Z",
  "durationMinutes": 60,
  "mode": "Online",
  "meetingLinkOrLocation": "https://meet.google.com/abc-def"
}
```

**`SubmitInterviewFeedbackRequest`**:
```json
{
  "interviewId": 12,
  "technicalRating": 4,
  "communicationRating": 3,
  "problemSolvingRating": 4,
  "culturalFitRating": 5,
  "strengths": "Strong in system design",
  "weaknesses": "Needs improvement in SQL",
  "recommendation": "Hire",
  "comments": "Recommended for senior track."
}
```

**`InterviewData`**:
```json
{
  "id": 12,
  "candidateId": 42,
  "candidateName": "Aditya Bhange",
  "vacancyTitle": "Full Stack React Developer",
  "interviewerUserId": 7,
  "interviewerName": "Rahul Sharma",
  "scheduledAt": "2026-08-20T10:00:00Z",
  "durationMinutes": 60,
  "mode": "Online",
  "meetingLinkOrLocation": "https://meet.google.com/abc-def",
  "status": "Completed",
  "roundDetails": [ ... ]
}
```

---

### 4H. Offer Letter APIs (`/api/v1/offers/...`)

| Method | Route | Body | Response | Auth |
|---|---|---|---|---|
| `GET` | `/offers/{id}` | — | `OfferLetterData` | HR, Director |
| `POST` | `/offers` | `GenerateOfferLetterRequest` | `OfferLetterData` | HR, Director |
| `POST` | `/offers/{id}/approve` | `{ directorPin }` | `{ approved }` | Director only |

**`GenerateOfferLetterRequest`**:
```json
{ "candidateId": 42, "offeredCTC": 12.5, "joiningDate": "2026-09-01" }
```

**`OfferLetterData`**:
```json
{
  "id": 5,
  "candidateId": 42,
  "candidateName": "Aditya Bhange",
  "vacancyId": 105,
  "vacancyTitle": "Full Stack React Developer",
  "offeredCTC": 12.5,
  "joiningDate": "2026-09-01",
  "status": "PendingApproval",
  "preparedByName": "HR Manager",
  "approvedByName": null,
  "approvedAt": null,
  "generatedPdfPath": "/offers/5/offer-letter.pdf"
}
```

---

### 4I. QR Code APIs (`/api/v1/qrcodes/...` and `/api/v1/publicregistration/...`)

| Method | Route | Body / Params | Response | Auth |
|---|---|---|---|---|
| `POST` | `/qrcodes/generate` | `CreateQRCodeRequest` | `QRCodeData` | HR, Director |
| `GET` | `/qrcodes/{id}/analytics` | — | `QRCodeAnalyticsData` | HR, Director |
| `GET` | `/qrcodes/vacancy/{vacancyId}` | — | `QRCodeData` | HR, Director |
| `GET` | `/publicregistration/{code}` | — | `QRScanResultData` | Public |
| `GET` | `/publicregistration/{code}/eligibility` | `?email&phone` | `QRRegistrationEligibilityData` | Public |
| `POST` | `/publicregistration` | `RegisterCandidateViaQRRequest` | `CandidateDetailData` | Public |

**`RegisterCandidateViaQRRequest`** (walk-in registration form):
```json
{
  "code": "WD-V2-PUNE-8921",
  "firstName": "Aditya",
  "lastName": "Bhange",
  "email": "aditya@gmail.com",
  "phone": "9876543210",
  "totalExperienceYears": 2.5,
  "currentCTC": 8.0,
  "expectedCTC": 12.0,
  "noticePeriodDays": 30,
  "currentLocation": "Pune",
  "highestQualification": "B.Tech"
}
```

**`QRScanResultData`**:
```json
{
  "qrCodeId": 52,
  "vacancyId": 105,
  "vacancyTitle": "Full Stack React Developer - ⚡ 1-Click Drive",
  "venueName": "Pune Assessment Center",
  "isOpenForRegistration": true,
  "message": null
}
```

**`QRRegistrationEligibilityData`**:
```json
{ "canApply": true, "eligibleFrom": null, "lastAppliedAt": null }
```

---

### 4J. V1 Question Papers APIs (`/api/v1/questionpapers/...`) — Legacy

> These are V1 static paper APIs. V2 uses the dynamic Question Bank instead. These remain for backward compatibility.

| Method | Route | Body | Response | Auth |
|---|---|---|---|---|
| `GET` | `/questionpapers` | — | `QuestionPaperItem[]` | HR, Director, Interviewer |
| `GET` | `/questionpapers/{id}` | — | `QuestionPaperData` | HR, Director, Interviewer |
| `POST` | `/questionpapers` | `CreateQuestionPaperRequest` | `QuestionPaperData` | HR, Director |
| `POST` | `/questionpapers/{id}/publish` | — | `{ published }` | HR, Director |
| `POST` | `/questionpapers/{id}/import-excel` | `multipart/form-data: file` | `{ imported }` | HR, Director |

---

### 4K. Reports APIs (`/api/v1/reports/...`)

| Method | Route | Response | Auth |
|---|---|---|---|
| `GET` | `/reports/recruitment-funnel` | `RecruitmentFunnelData` | HR, Director |

---

## 5. V2 Feature APIs

---

### [FEAT-V2-01] Assessment Templates & Section Rules (`/api/v2/assessment-templates`)

> **DESIGN DECISION**: The old Role-Tier Matrix has been permanently removed. Templates are selected at vacancy creation time. No pre-mapping.

| Method | Route | Body | Response | Auth |
|---|---|---|---|---|
| `GET` | `/v2/assessment-templates` | — | `AssessmentTemplateDto[]` | HR, Director, Interviewer (Read) |
| `POST` | `/v2/assessment-templates` | `SaveAssessmentTemplateRequest` | `AssessmentTemplateDto` | HR, Director |
| `PUT` | `/v2/assessment-templates/{id}` | `SaveAssessmentTemplateRequest` | `AssessmentTemplateDto` | HR, Director |
| `DELETE` | `/v2/assessment-templates/{id}` | — | `{ deleted: boolean }` | HR, Director |

> **Note**: Frontend `hiringProfilesApi.ts` currently points to `/v2/hiring-blueprints`. The backend can either serve at that path or update the frontend when wiring up real backend.

**`SaveAssessmentTemplateRequest`**:
```json
{
  "code": "RULE-TECH-ENG",
  "name": "Software Engineering Technical Track",
  "defaultPassingPercentage": 70,
  "sectionRules": [
    {
      "sectionName": "Technical MCQs (Single & Multi-Select)",
      "sectionType": "TechnicalMCQ",
      "questionType": "SINGLE_CHOICE",
      "experienceTier": "{InheritFromCandidateTier}",
      "requiredTags": "{InheritFromRole}",
      "questionCount": 20,
      "marksPerQuestion": 1.0,
      "timeLimitMinutes": 25,
      "selectionStrategy": "RandomShuffled",
      "displayOrder": 1
    }
  ]
}
```

**`AssessmentTemplateDto`** (response):
```json
{
  "id": 2,
  "code": "RULE-TECH-ENG",
  "name": "Software Engineering Technical Track",
  "defaultPassingPercentage": 70,
  "totalDurationMinutes": 85,
  "totalQuestions": 28,
  "totalMarks": 60.0,
  "enableQuestionShuffling": true,
  "enableOptionShuffling": true,
  "isDefault": false,
  "isActive": true,
  "sectionRules": [...]
}
```

#### DB Schema

```sql
CREATE TABLE master.AssessmentBlueprints (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(150) NOT NULL,
    DefaultPassingPercentage DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    TotalDurationMinutes INT NOT NULL DEFAULT 0,    -- computed by SP
    TotalQuestions INT NOT NULL DEFAULT 0,          -- computed by SP
    TotalMarks DECIMAL(5,2) NOT NULL DEFAULT 0.00,  -- computed by SP
    EnableQuestionShuffling BIT NOT NULL DEFAULT 1,  -- always 1, platform invariant
    EnableOptionShuffling BIT NOT NULL DEFAULT 1,    -- always 1, platform invariant
    IsDefault BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedBy NVARCHAR(100) NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedBy NVARCHAR(100) NULL,
    UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE master.AssessmentBlueprintSectionRules (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    BlueprintId INT NOT NULL FOREIGN KEY REFERENCES master.AssessmentBlueprints(Id) ON DELETE CASCADE,
    SectionName NVARCHAR(100) NOT NULL,
    SectionType NVARCHAR(50) NOT NULL,
        -- Valid: 'TechnicalMCQ', 'Coding', 'SQLQuery', 'SubjectiveTheory'
    QuestionType NVARCHAR(50) NOT NULL,
        -- Valid: 'SINGLE_CHOICE', 'MULTI_CHOICE', 'CODING', 'SQL', 'SUBJECTIVE'
    ExperienceTier NVARCHAR(100) NOT NULL DEFAULT '{InheritFromCandidateTier}',
        -- Always stored as '{InheritFromCandidateTier}'; resolved at exam session creation
    RequiredTags NVARCHAR(200) NOT NULL,
        -- '{InheritFromRole}' or explicit tags e.g. 'SQL,Joins,WindowFunctions'
    QuestionCount INT NOT NULL DEFAULT 5,
    MarksPerQuestion DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    TimeLimitMinutes INT NULL,
    SelectionStrategy NVARCHAR(50) NOT NULL DEFAULT 'RandomShuffled',
    DisplayOrder INT NOT NULL DEFAULT 1
);
```

#### 3 Seed Templates

| Code | Name | Sections | Total Q | Total Marks | Duration |
|---|---|---|---|---|---|
| `RULE-MCQ-ONLY` | Standard Assessment Track (MCQ Only) | 1 (20 MCQ) | 20 | 20 | 30m |
| `RULE-TECH-ENG` | Software Engineering Technical Track | 3 (20 MCQ + 5 Coding + 3 Subjective) | 28 | 60 | 85m |
| `RULE-DATA-SQL` | Database & SQL Engineering Track | 3 (20 MCQ + 5 SQL + 3 Subjective) | 28 | 60 | 85m |

#### SP: `sp_V2_SaveAssessmentTemplate`
- Insert or update template (if `@BlueprintId IS NULL` → INSERT; else → UPDATE)
- Delete and re-insert section rules from XML
- Recompute `TotalDurationMinutes`, `TotalQuestions`, `TotalMarks`
- Force `EnableQuestionShuffling = 1`, `EnableOptionShuffling = 1`
- Return `@NewBlueprintId INT OUTPUT = SCOPE_IDENTITY()`

#### SP: `sp_V2_DeleteAssessmentTemplate`
- Soft-delete (`IsActive = 0`)
- Reject with error if any `Vacancies.AssessmentBlueprintId = @BlueprintId` AND vacancy status is not `Cancelled` or `Closed`

#### Validation Rules
1. `Name` required, non-empty
2. At least 1 section rule required
3. `ExperienceTier` always stored as `{InheritFromCandidateTier}` — SP overrides any other value
4. `EnableQuestionShuffling` and `EnableOptionShuffling` always `1` — SP ignores client value
5. No `Difficulty` field — backend must reject requests containing it
6. `sectionType = 'Aptitude'` is invalid — reject with validation error

---

### [FEAT-V2-02] Central Question Bank (`/api/v2/question-bank`)

| Method | Route | Params / Body | Response | Auth |
|---|---|---|---|---|
| `GET` | `/v2/question-bank` | `?language&sectionType&questionType&experienceTier&isActive&search&page&pageSize` | `QuestionBankItem[]` + meta | HR, Director, Interviewer (Read) |
| `POST` | `/v2/question-bank` | `CreateQuestionRequest` | `QuestionBankItem` | HR, Director |
| `PUT` | `/v2/question-bank/{id}` | `UpdateQuestionRequest` | `QuestionBankItem` | HR, Director |
| `DELETE` | `/v2/question-bank/{id}` | — | `{ deleted }` | HR, Director |
| `POST` | `/v2/question-bank/bulk-delete` | `{ questionIds: number[] }` | `{ deletedCount }` | HR, Director |
| `POST` | `/v2/question-bank/bulk-status` | `{ questionIds: number[], isActive: boolean }` | `{ updatedCount }` | HR, Director |
| `POST` | `/v2/question-bank/bulk-import` | `{ questions: CreateQuestionRequest[] }` | `{ importedCount }` | HR, Director |
| `GET` | `/v2/question-bank/template` | — | `.xlsx` file download | HR, Director |

**`CreateQuestionRequest`**:
```json
{
  "code": "QB-DOT-01",
  "language": "C# (.NET)",
  "sectionType": "TechnicalMCQ",
  "questionType": "SINGLE_CHOICE",
  "experienceTier": "Mid-Level",
  "questionText": "What is the primary architectural difference between a class and a struct in C#?",
  "marks": 1.0,
  "sqlSchema": null,
  "starterCode": null,
  "testCases": null,
  "options": [
    { "label": "A", "text": "Class is a reference type (heap); Struct is a value type (stack).", "isCorrect": true },
    { "label": "B", "text": "Structs support inheritance while classes do not.", "isCorrect": false },
    { "label": "C", "text": "There is no difference in memory allocation.", "isCorrect": false },
    { "label": "D", "text": "Structs cannot have constructors.", "isCorrect": false }
  ],
  "isActive": true
}
```

**`QuestionBankItem`** (response):
```json
{
  "id": 1,
  "code": "QB-DOT-01",
  "language": "C# (.NET)",
  "sectionType": "TechnicalMCQ",
  "questionType": "SINGLE_CHOICE",
  "experienceTier": "Mid-Level",
  "questionText": "...",
  "marks": 1.0,
  "sqlSchema": null,
  "starterCode": null,
  "testCases": null,
  "options": [
    { "id": 101, "label": "A", "text": "Class is a reference type (heap); Struct is a value type (stack).", "isCorrect": true }
  ],
  "isActive": true,
  "createdAt": "2026-08-18T00:00:00Z",
  "updatedAt": "2026-08-18T00:00:00Z"
}
```

#### DB Schema

```sql
CREATE TABLE master.MasterQuestions (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Language NVARCHAR(100) NOT NULL,         -- matches master.ProgrammingLanguages.Name
    SectionType NVARCHAR(50) NOT NULL,        -- 'TechnicalMCQ','Coding','SQLQuery','SubjectiveTheory'
    QuestionType NVARCHAR(50) NOT NULL,       -- 'SINGLE_CHOICE','MULTI_CHOICE','CODING','SQL','SUBJECTIVE'
    ExperienceTier NVARCHAR(50) NOT NULL,     -- matches master.ExperienceLevels.Name (NOT difficulty)
    QuestionText NVARCHAR(MAX) NOT NULL,
    Marks DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    SqlSchema NVARCHAR(MAX) NULL,
    StarterCode NVARCHAR(MAX) NULL,
    TestCases NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedBy NVARCHAR(100) NULL,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedBy NVARCHAR(100) NULL,
    UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE master.MasterQuestionOptions (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    MasterQuestionId INT NOT NULL FOREIGN KEY REFERENCES master.MasterQuestions(Id) ON DELETE CASCADE,
    OptionLabel NVARCHAR(10) NOT NULL,   -- 'A', 'B', 'C', 'D'
    OptionText NVARCHAR(MAX) NOT NULL,
    IsCorrect BIT NOT NULL DEFAULT 0,
    DisplayOrder INT NOT NULL DEFAULT 1,
    CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

-- Dynamic sampler performance index
CREATE NONCLUSTERED INDEX IX_MasterQuestions_DynamicSampler
ON master.MasterQuestions(Language, SectionType, QuestionType, ExperienceTier, IsActive)
INCLUDE (Id, Code, QuestionText, Marks);
```

#### Excel Import Template Columns

| Column | Required | Notes |
|---|---|---|
| Code | Optional | Auto-generated as `QB-{LANG}-{N}` if blank |
| Language | Required | Dropdown: `master.ProgrammingLanguages.Name` values + `General Aptitude` |
| Section Type | Required | Dropdown: `TechnicalMCQ` / `Coding` / `SQLQuery` / `SubjectiveTheory` |
| Question Type | Required | Dropdown: `SINGLE_CHOICE` / `MULTI_CHOICE` / `CODING` / `SQL` / `SUBJECTIVE` |
| Experience Tier | Required | Dropdown: `Fresher` / `Junior` / `Mid-Level` / `Senior` / `Lead` |
| Question Text | Required | |
| Marks | Required | Decimal |
| Option A Text | Conditional | Required for MCQ types |
| Option A Correct | Conditional | `TRUE`/`FALSE` |
| Option B Text | Conditional | Required for MCQ types |
| Option B Correct | Conditional | `TRUE`/`FALSE` |
| Option C Text | Optional | |
| Option C Correct | Optional | |
| Option D Text | Optional | |
| Option D Correct | Optional | |
| SQL Schema | Conditional | Required when Section Type = `SQLQuery` |
| Starter Code | Optional | For Coding sections |
| Test Cases | Optional | For auto-grading |

#### Validation Rules
1. `SINGLE_CHOICE`: 2–4 options, exactly ONE `isCorrect = true`
2. `MULTI_CHOICE`: 2–4 options, AT LEAST ONE `isCorrect = true`
3. `SQL` type: `sqlSchema` required
4. `ExperienceTier` must match a valid `master.ExperienceLevels.Name`
5. NO `difficulty` field — reject if present
6. No time limit per question — governed by section rule `TimeLimitMinutes`

#### Stored Procedures
- **`sp_V2_AddMasterQuestion`**: Inserts question + options atomically. Returns `@NewQuestionId OUTPUT`
- **`sp_V2_UpdateMasterQuestion`**: Updates question; deletes + re-inserts options atomically
- **`sp_V2_BulkDeleteQuestions`**: Soft-deletes by `@QuestionIdsXml XML`
- **`sp_V2_BulkToggleQuestionStatus`**: Sets `IsActive` by XML list
- **`sp_V2_SearchMasterQuestions`**: Filtered paginated query. Output: Recordset 1 (questions + options JSON), Recordset 2 (total count + tier distribution)

---

### [FEAT-V2-03] Vacancy Creation with Template Selection

When HR creates a vacancy, `AssessmentBlueprintId` is stored as FK. This replaces the old Role-Tier Matrix.

**Additional fields on `Vacancies` table**:
```sql
ALTER TABLE vacancies.Vacancies ADD
    AssessmentBlueprintId INT NULL FOREIGN KEY REFERENCES master.AssessmentBlueprints(Id),
    PassingPercentageOverride DECIMAL(5,2) NULL;  -- overrides template default for this vacancy
```

Effective passing percentage = `PassingPercentageOverride ?? AssessmentBlueprints.DefaultPassingPercentage`

---

### [FEAT-V2-04] 1-Click Instant Drive + Temp Exam Pass (`/api/v2/vacancies/instant-drive`, `/api/v2/exams/temp-pass`)

| Method | Route | Body | Response | Auth |
|---|---|---|---|---|
| `POST` | `/v2/vacancies/instant-drive` | `CreateInstantDriveCommand` | `InstantDriveResultData` | HR, Director |
| `POST` | `/v2/exams/temp-pass` | `GenerateTempPassRequest` | `TempExamPassData` | HR, Director |

**`CreateInstantDriveCommand`**:
```json
{
  "roleId": 1,
  "profileId": 2,
  "driveType": "Walk-in Drive",
  "departmentId": 2,
  "hiringLocationId": 1,
  "totalOpenings": 10,
  "walkinDate": "2026-08-25"
}
```
> **Backend Property Binding Aliases**: The backend command handler natively binds both property conventions:
> - `roleId` $\leftrightarrow$ `masterRoleId`
> - `profileId` $\leftrightarrow$ `assessmentBlueprintId` $\leftrightarrow$ `roleHiringProfileId`
> - `walkinDate` $\leftrightarrow$ `walkinDriveDate`
> - `driveType`: `'Walk-in Drive'` (default, with QR generation & Round 1 Aptitude Elimination) or `'Direct / Sourced Hiring'` (direct candidate portal link, Round 1 HR Screening is Auto-Passed).

**`InstantDriveResultData`**:
```json
{
  "vacancyId": 105,
  "vacancyCode": "VAC-2026-105",
  "title": "Full Stack React Developer - 1-Click Drive",
  "profileName": "Software Engineering Technical Track",
  "departmentName": "Engineering",
  "hiringLocationName": "Pune Assessment Center",
  "totalOpenings": 10,
  "minExperienceYears": 0.0,
  "maxExperienceYears": 99.0,
  "passingPercentage": 70.0,
  "questionPaperTitle": "Software Engineering Technical Track",
  "totalQuestions": 28,
  "durationMinutes": 85,
  "qrCodeId": 52,
  "qrCodeString": "WD-V2-PUNE-8921",
  "registrationUrl": "http://localhost:3000/apply/v2/WD-V2-PUNE-8921",
  "qrCodeDataUrl": "/api/v2/qrcodes/vacancy/105"
}
```

**`GenerateTempPassRequest`** (for HR to generate a test pass for a specific candidate):
```json
{
  "candidateId": 42,
  "vacancyId": 105
}
```

**`TempExamPassData`**:
```json
{
  "candidateCode": "CAN-2026-1042",
  "passcode": "5821",
  "candidateName": "Aditya Bhange",
  "roleName": "Full Stack React & Node Developer",
  "examUrl": "http://localhost:3000/exam/v2",
  "expiresAtUtc": "2026-08-18T12:00:00Z",
  "validityHours": 24
}
```

#### SP: `sp_V2_CreateInstantDrive`
- Validates blueprint pool availability
- Creates `Vacancy` (with `AssessmentBlueprintId` and `DriveType`)
- Creates `VacancyPipelineFlow` with standardized 4 rounds:
  - **Walk-in Drive Track** (`DriveType = 'Walk-in Drive'`):
    1. `Round 1`: **Aptitude Assessment (Elimination Round)** — Candidates who fail (< 70%) are eliminated and locked from taking technical tests.
    2. `Round 2`: **Technical Assessment (Coding / SQL / Tech MCQs)** — Unlocked only after clearing Round 1 Aptitude.
    3. `Round 3`: **Technical Interview** — Evaluator panel / live code interview.
    4. `Round 4`: **Managerial & HR Interview / Offer Generation** — 1-Click Director PIN approval.
  - **Direct / Sourced Hiring Track** (`DriveType = 'Direct / Sourced Hiring'`):
    1. `Round 1`: **HR Sourcing & Screening** — Auto-Passed on invite (pre-screened resume).
    2. `Round 2`: **Technical Spot Assessment** — 24-hour Spot Test Pass.
    3. `Round 3`: **Technical Interview** — Evaluator panel.
    4. `Round 4`: **Offer Generation** — 1-Click Director PIN approval.
- Creates `QRCode` with unique code and registration URL (for Walk-in drives) or Direct Screening Link (for Direct Sourced hiring)
- Returns `@NewVacancyId`, `@NewQRCodeId` (both SCOPE_IDENTITY outputs)

---

### [FEAT-V2-05] V2 Exam Session — Dynamic Question Sampler (`/api/v2/exams/...`)

| Method | Route | Body | Response | Auth |
|---|---|---|---|---|
| `POST` | `/v2/exams/batch-answers` | `BatchAnswerSyncRequest` | `BatchAnswerSyncData` | Public (candidate) |
| `POST` | `/v2/exams/{sessionId}/auto-grade-publish` | `{ remarks? }` | `PublishResultData` | HR, Director |

> **V2 Exam Start**: Uses the same V1 `/exams/start` endpoint but the session creation logic is different when `AssessmentBlueprintId` is set on the vacancy — it uses the Dynamic Sampler path instead of static question paper path.

**Dynamic Sampler Logic** (in `sp_V2_CreateDynamicExamSession`):
1. Candidate arrives via `/apply/v2/{code}` → registers → gets `candidateCode` + `passcode`
2. Candidate hits `/exams/start` with those credentials
3. Backend detects vacancy has `AssessmentBlueprintId` → uses V2 sampling path
4. Resolves candidate's `ExperienceTier` from `master.ExperienceLevels` based on `totalExperienceYears`
5. Resolves vacancy role's `PrimaryLanguage` for sections with `RequiredTags = '{InheritFromRole}'`
6. Queries `master.MasterQuestions WHERE Language = resolvedLanguage AND ExperienceTier = candidateTier AND SectionType = sectionType AND IsActive = 1`
7. Randomly samples `QuestionCount` questions per section using deterministic seed `(candidateId XOR vacancyId)`
8. Shuffles both question order and option A/B/C/D labels (always on — platform invariant)
9. Creates immutable snapshot in `exam.CandidateExamSessionQuestions` with `QuestionSnapshotJson` and randomized `DisplayOptionLabel`

**ExperienceTier Resolution from `totalExperienceYears`**:
```
0.0 - 1.0  → Fresher
1.0 - 3.0  → Junior
3.0 - 5.0  → Mid-Level
5.0 - 8.0  → Senior
8.0+       → Lead
```
(Use `master.ExperienceLevels.MinYears` / `MaxYears` — not hardcoded)

**`BatchAnswerSyncRequest`**:
```json
{
  "sessionToken": "ses_abc123",
  "answers": [
    {
      "candidateExamSessionQuestionId": 501,
      "selectedOptionIds": [1201],
      "submittedAnswerText": null
    }
  ]
}
```

**`BatchAnswerSyncData`**:
```json
{
  "syncedCount": 5,
  "serverSyncedAtUtc": "2026-08-18T09:45:00Z",
  "sessionStatus": "InProgress"
}
```

#### SP: `sp_V2_SaveExamAnswerBatch`
- Idempotent UPSERT for each answer (handles repeated syncs)
- Input: `@SessionToken NVARCHAR(200)`, `@AnswersXml XML`

#### SP: `sp_V2_EvaluateAndPublishAssessment`
- Compare candidate selected option IDs against frozen `IsCorrect` values in snapshot
- Auto-grade MCQ (`SINGLE_CHOICE`, `MULTI_CHOICE`) immediately
- Mark Coding/SQL/Subjective as `PendingManualEvaluation`
- Calculate total score and sectional scores
- Set `ResultStatus = 'Pass'` or `'Fail'` based on effective passing percentage
- If pass → call candidate advancement logic (set `CandidateStatus` to next round)

---

### [FEAT-V2-06] Section Timing Engine & Anti-Cheat Validation Rules

#### 1. Dynamic Section Timing State Machine (Zero Hardcoded Times)
* **Time Derivation Rule**: Section duration is dynamically derived by summing `CandidateExamSessionQuestion.TimeAllowedMinutes` for all questions in that section, OR from `RoleAssessmentSectionRule.AllocatedMinutes`. Total exam duration is the sum across all sections.
* **Sequential Section Locking**:
  - When Section $K$ completes (via manual progression or timer expiry), Section $K$ is permanently added to `LockedSectionIdsCsv`.
  - **No Backtracking**: Candidates cannot navigate back to any previously locked section ($\le K$). Any API attempt to submit answers for locked sections is rejected with `403 Forbidden` (`ERR_SECTION_LOCKED`).
* **30-Second Section Transition Dialog**:
  - When a section times out or is completed, the frontend displays a 30-second transition dialog modal with an auto-countdown and an explicit *"Start Immediately"* action.
  - When the 30s countdown reaches 0 or the candidate clicks *"Start Immediately"*, Section $K+1$ begins.
* **Auto-Submission on Total Expiration**:
  - When `TotalTimeLeftSeconds <= 0` or the final section concludes, the exam session is automatically marked as `AutoSubmitted` and pending answers are saved.

#### 2. Security & Anti-Cheat Validation Rules
* **Tab Switch / Focus Loss Limit (3 Max Warnings)**:
  - Every `visibilitychange` (tab switch) or window blur event increments `TabSwitchWarningCount`.
  - Violations 1 & 2 return warning alerts to the candidate.
  - On the **3rd violation**, the session is immediately terminated with `Status = 'TerminatedForCheating'`, all sections are locked, and an audit entry is written to `ExamProctoringLogs`.
* **Fullscreen Integrity & Exit Logging**:
  - Every exit from fullscreen is logged to `ExamProctoringLogs` with timestamp, client IP, and user-agent.
  - The UI does not expose any back/exit buttons in the top HUD to prevent accidental fullscreen breaks.
* **Multi-Tab Prevention**:
  - Simultaneous active instances of the same session in different browser tabs or windows are immediately locked with `ERR_MULTI_TAB_DETECTED`.

#### 3. Automated Grading Engine & Scoring Rules
* **Single Choice MCQ**:
  $$\text{Score} = \begin{cases} \text{Marks}, & \text{if selected option is correct} \\ 0, & \text{otherwise} \end{cases}$$
* **Multiple Choice MCQ (Proportional Scoring)**:
  $$\text{Score} = \max\left(0, \frac{\text{Correct Selected} - \text{Wrong Selected}}{\text{Total Correct Options}} \times \text{Marks}\right)$$
* **SQL Query Sandbox**:
  - Executes candidate query in sandbox SQL database.
  - Compares syntax, row count, projected column names, and row data values against the expected reference dataset.
* **Coding Challenge Sandbox**:
  - Executes code against public and hidden test cases with timeout (2s) and memory constraints.
  $$\text{Score} = \left(\frac{\text{Passed Test Cases}}{\text{Total Test Cases}}\right) \times \text{Marks}$$

#### 4. Complete Validation & Error Handling Matrix

| Error Code | HTTP Status | Trigger Condition | Candidate / UI Action |
|---|:---:|---|---|
| `ERR_INVALID_CREDENTIALS` | `401 Unauthorized` | Invalid Candidate Code or Passcode | Shows login error message |
| `ERR_EXAM_EXPIRED` | `400 Bad Request` | Spot test pass created $> 24\text{h}$ ago | Prompts candidate to contact HR for new pass |
| `ERR_EXAM_ALREADY_SUBMITTED` | `400 Bad Request` | Session already marked Submitted | Shows completion certificate / result screen |
| `ERR_SECTION_LOCKED` | `403 Forbidden` | Candidate attempts to post answer to locked section | Rejects update; refreshes active section |
| `ERR_MAX_TAB_SWITCH_EXCEEDED`| `403 Forbidden` | 3rd tab-switch violation recorded | Locks exam, terminates session, logs audit trail |
| `ERR_MULTI_TAB_DETECTED` | `409 Conflict` | Same session opened in 2 separate browser tabs | Locks duplicate tab with anti-cheat banner |
| `ERR_POOL_DEFICIT` | `422 Unprocessable` | Question Bank has fewer active questions than rule requires | Displays deficit warning in Admin/HR Drive Modal |

---

## 6. Complete DB Schema Summary

### Active V2 Master Tables

```sql
master.AssessmentBlueprints            -- Assessment Templates (replaces RoleTierMatrixMappings)
master.AssessmentBlueprintSectionRules -- Section rules per template
master.MasterQuestions                 -- Central question pool
master.MasterQuestionOptions           -- MCQ option choices
master.ExperienceLevels                -- Experience tiers: Fresher/Junior/Mid-Level/Senior/Lead
master.ProgrammingLanguages            -- Language domains for question tagging + IDE
master.MasterRoles                     -- Job role definitions
master.Departments                     -- Business units
master.EmploymentTypes                 -- Employment type taxonomy
master.HiringLocations                 -- Office location taxonomy
```

### Legacy V1 Tables (do NOT use in V2 logic)

```
master.RoleTierMatrixMappings    → REMOVED (template selected at vacancy creation)
master.TestLocations             → REPLACED by digital QR drive system
exam.QuestionPapers              → REPLACED by AssessmentBlueprints + MasterQuestions
exam.QuestionPaperSections       → REPLACED by AssessmentBlueprintSectionRules
exam.Questions                   → REPLACED by MasterQuestions
exam.QuestionOptions             → REPLACED by MasterQuestionOptions
```

---

## 7. Complete Stored Procedure Catalog

| SP Name | Purpose | Outputs Identity IDs |
|---|---|---|
| `sp_V2_SaveAssessmentTemplate` | Upsert template + section rules; compute totals | `AssessmentBlueprints.Id`, `AssessmentBlueprintSectionRules.Id` |
| `sp_V2_DeleteAssessmentTemplate` | Soft-delete; block if active vacancy references it | None |
| `sp_V2_GetAssessmentPoolStatus` | Live question pool availability check per template | None (read) |
| `sp_V2_AddMasterQuestion` | Insert question + options atomically | `MasterQuestions.Id`, `MasterQuestionOptions.Id` |
| `sp_V2_UpdateMasterQuestion` | Update question; replace options atomically | `MasterQuestionOptions.Id` |
| `sp_V2_BulkDeleteQuestions` | Soft-delete by ID XML list | None |
| `sp_V2_BulkToggleQuestionStatus` | Batch activate/deactivate | None |
| `sp_V2_SearchMasterQuestions` | Filtered paginated search with metrics | None (read) |
| `sp_V2_CreateInstantDrive` | Atomic create: Vacancy + Pipeline + 3 Rounds + QR Code | `Vacancies.Id`, `QRCodes.Id` |
| `sp_V2_CreateDynamicExamSession` | Resolve tier + language, sample questions, write immutable snapshot | `CandidateExamSessions.Id`, `CandidateExamSessionQuestions.Id` |
| `sp_V2_SaveExamAnswerBatch` | Idempotent batch upsert for candidate answers | `CandidateExamAnswers.Id` |
| `sp_V2_EvaluateAndPublishAssessment` | Auto-grade MCQs, compute score, set result status | None |

---

## 8. Frontend RTK Query Hook ↔ Backend Endpoint Map

| RTK Hook | HTTP Method + Route | Tag Cache |
|---|---|---|
| `useLoginMutation` | `POST /auth/login` | — |
| `useDirectorPinLoginMutation` | `POST /auth/director-pin-login` | — |
| `useRefreshTokenMutation` | `POST /auth/refresh-token` | — |
| `useGetUsersQuery` | `GET /users` | `Users` |
| `useCreateUserMutation` | `POST /users` | `Users` |
| `useUpdateUserMutation` | `PUT /users/{id}` | `Users` |
| `useChangePasswordMutation` | `POST /users/change-password` | — |
| `useChangePinMutation` | `POST /users/change-pin` | — |
| `useGetMasterDataByCategoryQuery` | `GET /masterdata/{category}` | `MasterData` |
| `useCreateMasterDataMutation` | `POST /masterdata/{category}` | `MasterData` |
| `useUpdateMasterDataMutation` | `PUT /masterdata/{category}/{id}` | `MasterData` |
| `useDeleteMasterDataMutation` | `DELETE /masterdata/{category}/{id}` | `MasterData` |
| `useToggleMasterDataStatusMutation` | `PATCH /masterdata/{category}/{id}/toggle-status` | `MasterData` |
| `useGetVacanciesQuery` | `GET /vacancies` | `Vacancies` |
| `useGetVacancyByIdQuery` | `GET /vacancies/{id}` | `Vacancies` |
| `useCreateVacancyMutation` | `POST /vacancies` | `Vacancies` |
| `useUpdateVacancyMutation` | `PUT /vacancies/{id}` | `Vacancies` |
| `useCreatePipelineFlowMutation` | `POST /pipelineflows` | `Vacancies` |
| `useUpdatePipelineFlowMutation` | `PUT /pipelineflows/{id}` | `Vacancies` |
| `useDeletePipelineFlowMutation` | `DELETE /pipelineflows/{id}` | `Vacancies` |
| `useAssignQuestionPaperToRoundMutation` | `POST /pipelineflows/rounds/{roundId}/assign-question-paper` | `Vacancies` |
| `useGetCandidatesQuery` | `GET /candidates` | `Candidates` |
| `useGetCandidateByIdQuery` | `GET /candidates/{id}` | `Candidates` |
| `useRegisterCandidateMutation` | `POST /candidates` | `Candidates` |
| `useUpdateCandidateMutation` | `PUT /candidates/{id}` | `Candidates` |
| `useAssignPipelineFlowMutation` | `POST /candidates/{id}/assign-flow` | `Candidates` |
| `useAssignEvaluatorMutation` | `POST /candidates/{id}/assign-evaluator` | `Candidates` |
| `useUploadCandidateDocumentMutation` | `POST /candidates/{id}/documents` | `Candidates` |
| `useDeleteCandidateDocumentMutation` | `DELETE /candidates/{id}/documents/{documentId}` | `Candidates` |
| `useScheduleCandidateTestMutation` | `POST /candidates/{id}/schedule-test` | `Candidates` |
| `useEvaluateCandidateStageMutation` | `POST /candidates/{id}/evaluate-stage` | `Candidates` |
| `useStartExamSessionMutation` | `POST /exams/start` | `Exams` |
| `useResumeExamSessionQuery` | `GET /exams/{token}/resume` | `Exams` |
| `useSaveExamAnswerMutation` | `POST /exams/{token}/save-answer` | — |
| `useSubmitExamMutation` | `POST /exams/{token}/submit` | `Exams`, `Candidates` |
| `useReportExamViolationMutation` | `POST /exams/{token}/violation` | — |
| `useGetExamEvaluationQuery` | `GET /exams/{id}/evaluation` | `Exams` |
| `useEvaluateAnswerMutation` | `POST /exams/{id}/evaluation/answers/{answerId}` | `Exams` |
| `usePublishAssessmentResultMutation` | `POST /exams/{id}/publish` | `Exams`, `Candidates` |
| `useGetInterviewByIdQuery` | `GET /interviews/{id}` | `Interviews` |
| `useScheduleInterviewMutation` | `POST /interviews/schedule` | `Interviews`, `Candidates` |
| `useSubmitInterviewFeedbackMutation` | `POST /interviews/feedback` | `Interviews` |
| `usePublishInterviewResultMutation` | `POST /interviews/{id}/publish` | `Interviews`, `Candidates` |
| `useGetOfferByIdQuery` | `GET /offers/{id}` | `Offers` |
| `useGenerateOfferLetterMutation` | `POST /offers` | `Offers`, `Candidates` |
| `useApproveOfferMutation` | `POST /offers/{id}/approve` | `Offers`, `Candidates` |
| `useGenerateQRCodeMutation` | `POST /qrcodes/generate` | `QRCodes` |
| `useGetQRCodeAnalyticsQuery` | `GET /qrcodes/{id}/analytics` | `QRCodes` |
| `useGetQRCodeByVacancyQuery` | `GET /qrcodes/vacancy/{vacancyId}` | `QRCodes` |
| `useRecordQRScanQuery` | `GET /publicregistration/{code}` | — |
| `useCheckQRRegistrationEligibilityQuery` | `GET /publicregistration/{code}/eligibility` | — |
| `useRegisterCandidateViaQRMutation` | `POST /publicregistration` | `Candidates` |
| `useGetQuestionPapersQuery` | `GET /questionpapers` | `QuestionPapers` |
| `useGetQuestionPaperByIdQuery` | `GET /questionpapers/{id}` | `QuestionPapers` |
| `useCreateQuestionPaperMutation` | `POST /questionpapers` | `QuestionPapers` |
| `usePublishQuestionPaperMutation` | `POST /questionpapers/{id}/publish` | `QuestionPapers` |
| `useImportQuestionPaperExcelMutation` | `POST /questionpapers/{id}/import-excel` | `QuestionPapers` |
| `useGetRecruitmentFunnelQuery` | `GET /reports/recruitment-funnel` | `Reports` |
| `useGetBlueprintsV2Query` | `GET /v2/hiring-blueprints` | `MasterData` |
| `useSaveBlueprintV2Mutation` | `POST/PUT /v2/hiring-blueprints/{id?}` | `MasterData` |
| `useDeleteBlueprintV2Mutation` | `DELETE /v2/hiring-blueprints/{id}` | `MasterData` |
| `useGetQuestionBankQuery` | `GET /v2/question-bank` | `QuestionBank` |
| `useCreateQuestionBankMutation` | `POST /v2/question-bank` | `QuestionBank` |
| `useUpdateQuestionBankMutation` | `PUT /v2/question-bank/{id}` | `QuestionBank` |
| `useDeleteQuestionBankMutation` | `DELETE /v2/question-bank/{id}` | `QuestionBank` |
| `useBulkDeleteQuestionBankMutation` | `POST /v2/question-bank/bulk-delete` | `QuestionBank` |
| `useBulkToggleQuestionBankStatusMutation` | `POST /v2/question-bank/bulk-status` | `QuestionBank` |
| `useBulkImportQuestionBankMutation` | `POST /v2/question-bank/bulk-import` | `QuestionBank` |
| `useCreateInstantDriveV2Mutation` | `POST /v2/vacancies/instant-drive` | `Vacancies`, `QRCodes` |
| `useGenerateTempExamPassV2Mutation` | `POST /v2/exams/temp-pass` | `Candidates` |
| `useSaveExamAnswerBatchV2Mutation` | `POST /v2/exams/batch-answers` | — |
| `usePublishAssessmentResultV2Mutation` | `POST /v2/exams/{id}/auto-grade-publish` | `Exams`, `Candidates` |

> **Note on hiringProfilesApi.ts routes**: `useGetRoleHiringProfilesV2Query` → `/v2/vacancies/roles/{roleId}/profiles` and legacy matrix routes (`/v2/role-tier-matrix`) are present in the frontend service file but no longer used by any component after the matrix removal. They can remain as stubs or be cleaned up when wiring real backend.

---

## 9. App Routes Reference

| Frontend Route | Purpose |
|---|---|
| `/` | Login page |
| `/dashboard` | HR / Director main dashboard |
| `/dashboard/candidates/{id}/evaluation` | Assessment evaluation view |
| `/dashboard/vacancies/{id}` | Vacancy detail view |
| `/apply/{code}` | V1 QR walk-in registration page |
| `/apply/v2/{code}` | V2 QR walk-in registration page |
| `/exam` | V1 candidate exam portal |
| `/exam/v2` | V2 candidate exam portal (dynamic sampler) |
