# STEP Enterprise Platform — Codebase Master Architecture Registry & Live Audit

**Document:** `docs/CODEBASE_MASTER_AUDIT.md`  
**System Name:** STEP (Sthapatya Talent Excellence Platform)  
**Enterprise:** SCIPL (Sthapatya Consultants India Pvt. Ltd.)  
**Current Version:** 2.4.0 (Enterprise Production Architecture)  
**Last Synchronized:** 2026-08-30  
**Rule:** _This document is the authoritative single source of truth. It MUST be consulted before making code changes and updated immediately after any architectural or feature modifications._

---

## 1. System Overview & Technology Matrix

| Layer                                 | Technology / Framework                | Key Libraries & Standards                                                  |
| :------------------------------------ | :------------------------------------ | :------------------------------------------------------------------------- |
| **Frontend Framework**                | **Next.js 14+ (App Router)**          | React 18, TypeScript (Strict Mode)                                         |
| **Styling & Design System**           | **Tailwind CSS v4**                   | CSS Variables Theme Tokens, Radix UI Primitives, Lucide Icons              |
| **Animation & UI Micro-interactions** | **Framer Motion 11+**                 | Kinetic feedback, slide transitions, spring physics                        |
| **Client State & Network Cache**      | **Redux Toolkit + RTK Query**         | Tag-based cache invalidation, typed queries & mutations                    |
| **Backend Core**                      | **.NET 10 (C# 13 / net10.0)**         | Clean Architecture (Domain, Application, Persistence, Infrastructure, Api) |
| **CQRS & Mediator Pattern**           | **MediatR 12+**                       | Isolated Queries, Commands, Pipeline Behaviors, FluentValidation           |
| **Database & ORM**                    | **Microsoft SQL Server / Azure SQL**  | Entity Framework Core 9 / 10, Code-First Migrations, Isolated Schemas      |
| **Auth & Security**                   | **JWT Bearer + Director 4-Digit PIN** | ASP.NET Identity, PBKDF2/Argon2 PIN hashing, CORS policies                 |

---

## 2. Database Architecture & Schema Registry

STEP utilizes strict PostgreSQL/SQL Server schema isolation across business domains:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STEP DATABASE SCHEMAS                           │
├──────────────┬──────────────┬──────────────┬──────────────┬────────────┤
│   master     │   identity   │   vacancy    │  candidate   │   examv2   │
│ (Core Data)  │  (Auth/RBAC) │  (Campaigns) │  (Lifecycle) │ (Testing)  │
└──────────────┴──────────────┴──────────────┴──────────────┴────────────┘
```

### 2.1 Schema Breakdown & Entities

1. **`master` Schema**:
   - `MasterRoles`: Canonical enterprise designations (e.g. _Senior .NET Core Architect_, _QA Lead_).
   - `MasterDepartments`: Business units (_Engineering_, _QA_, _DevOps_, _Human Resources_).
   - `MasterHiringLocations`: Official company locations (_Pune Center_, _Mumbai HQ_, _Bengaluru_).
   - `MasterEmploymentTypes`: Work contracts (_Full-time_, _Contract_, _Internship_).
   - `MasterExperienceLevels`: Seniority brackets (_Fresher_, _1-3 Yrs_, _3-5 Yrs_, _5+ Yrs_).
2. **`identity` Schema**:
   - `Users`: Enterprise admins, HR recruiters, interviewers, directors.
   - `Roles` / `UserRoles`: Role-based access control permissions.
3. **`vacancy` Schema**:
   - `Vacancies`: Hiring campaigns with hiring location, role, department, open positions, and status (`Active`, `Draft`, `Closed`).
   - `VacancyRounds`: Configured hiring stages (e.g., Round 1: _Aptitude/Technical Assessment_, Round 2: _Technical Interview_, Round 3: _Director Round_).
   - `VacancyInterviewers`: Assigned interviewers and stage evaluators.
4. **`candidate` Schema**:
   - `Candidates`: Master candidate profile (`Code`, `Name`, `Email`, `Phone`, `CurrentLocation`, `ResumeUrl`, `RegistrationChannel` [Direct/WalkIn]).
   - `CandidatePipelineProgress`: Live round progression tracker (`CurrentRoundId`, `RoundStatus` [Scheduled, In-Progress, Passed, Failed], `InterviewerId`).
   - `CandidateEvaluationRatings`: Detailed scoring rubrics per interview round.
5. **`examv2` Schema**:
   - `AssessmentBlueprints`: Reusable test blueprints with rule sections, question counts, difficulty, and pass cutoffs.
   - `CandidateExamSessionsV2`: Immutable snapshot of a candidate's exam attempt (`SessionToken`, `IntegrityScore`, `TabSwitchCount`, `TotalScore`, `ResultStatus` [Pass/Fail]).
   - `CandidateExamSessionQuestionsV2` / `Options`: Frozen test questions.
   - `CandidateExamAnswersV2`: Submitted candidate code, SQL queries, and MCQ choices.
   - `ExamProctoringLogs` & `ExamProctoringSnapshots`: Tab-switch incidents, audio spikes, and webcam frames.

---

## 3. Backend CQRS & API Endpoint Directory

### 3.1 Authentication (`STEP.Api/Controllers/AuthController.cs`)

- `POST /api/auth/login`: Standard corporate email & password JWT authentication.
- `POST /api/auth/director-pin`: 4-digit PIN access for instant Director evaluation mode.
- `POST /api/auth/refresh-token`: Session token renewal.

### 3.2 Candidates (`STEP.Api/Controllers/CandidatesController.cs`)

- `GET /api/candidates`: Query handler with stage, role, location, status, and date-range filtering.
- `GET /api/candidates/{id}`: Full candidate 360° profile with pipeline history and documents.
- `POST /api/candidates`: Manual candidate registration (HR form).
- `POST /api/candidates/public-register`: Public walk-in QR code registration.
- `POST /api/candidates/{id}/advance-stage`: Advances candidate to the next hiring round.
- `POST /api/candidates/{id}/reject`: Archives/rejects candidate with reason.

### 3.3 Vacancies & Campaigns (`STEP.Api/Controllers/VacanciesController.cs`)

- `GET /api/vacancies`: List all campaigns with real-time candidate count and fulfillment %.
- `GET /api/vacancies/{id}`: Detailed vacancy campaign view with assigned rounds & candidates.
- `POST /api/vacancies`: Create new vacancy campaign.
- `PUT /api/vacancies/{id}`: Update vacancy details, requirements, and hiring targets.
- `POST /api/vacancies/instant-drive`: Generate Instant Walk-in Drive QR code and link.

### 3.4 Examination & Proctoring (`STEP.Api/Controllers/ExamsController.cs`)

- `POST /api/exams/session/start`: Validates candidate passcode & returns frozen test workspace.
- `POST /api/exams/session/answers`: Batched auto-save for MCQ answers, SQL, and code editor.
- `POST /api/exams/session/submit`: Final submission & automated grading engine.
- `POST /api/exams/session/violation`: Reports tab-switch, audio spike, or camera violation (3-strike rule).

### 3.5 Master Data & Users (`STEP.Api/Controllers/MasterDataController.cs`, `UsersController.cs`)

- `GET /api/master-data/{category}`: Dynamic master data loader (`roles`, `departments`, `hiringlocations`, etc.).
- `POST /api/master-data/{category}` / `PUT /api/master-data/{category}/{id}`: Master CRUD.
- `GET /api/users` / `POST /api/users`: Enterprise user & interviewer management.

---

## 4. Frontend Route & Component Architecture

```
frontend/src/
├── app/
│   ├── page.tsx                           # Login / Director Mode Entry
│   ├── apply/page.tsx                     # Universal Candidate Application Portal (Single QR / Open Intake)
│   ├── apply/[code]/page.tsx              # Specific Vacancy Campaign Registration
│   ├── exam/page.tsx                      # Candidate Proctored Exam Portal
│   └── dashboard/
│       ├── page.tsx                       # Main Dashboard (Candidates Table & Metrics)
│       ├── vacancies/page.tsx             # Vacancies & Walk-In Campaign Grid
│       ├── vacancies/[id]/page.tsx        # Vacancy Workspace & Candidate Flow Assignment
│       ├── candidates/page.tsx            # Full Candidate Directory
│       ├── candidates/[id]/page.tsx       # Candidate 360 Profile & Resume Viewer
│       ├── candidates/[id]/evaluation/    # Technical Interview Evaluation Form
│       ├── assessments/page.tsx           # Assessment Blueprints & Test Monitor
│       ├── reports/page.tsx               # Analytics, Funnel Charts, Data Exports
│       ├── users/page.tsx                 # User Management & Roles Table
│       └── settings/page.tsx              # Master Data Settings & Schema Tables
├── design-system/                         # Core UI Components & Primitives
│   ├── components/
│   │   ├── select/select.tsx              # Universal CustomSelect (rounded-xl, tokenized)
│   │   ├── custom-calendar-picker/        # Single Date Picker (Forms / DOB)
│   │   │   ├── CustomCalendarPicker.tsx   # Untouched single-date picker
│   │   │   └── CustomDateRangePicker.tsx  # Dual range picker with presets (Filter bar)
│   │   ├── modal/                         # Radix Modal Dialogs
│   │   └── icon/                          # Lucide Icon Registry
├── features/                              # Feature-sliced Business Modules
│   ├── dashboard/
│   │   ├── candidates/                    # CandidateWorkspace, CandidateTable
│   │   ├── shared/FilterBar.tsx           # Inline Multi-Filter Toolbar
│   │   └── shared/TablePagination.tsx     # Enterprise Standardized Pagination Component
│   ├── vacancies/                         # VacancyCard, InstantDriveModalV2, FlowAssignment
│   ├── candidates/                        # CandidateProfilePage, EvaluationView
│   ├── assessments/                       # CandidateExamPortalV2, CodeEditorIDE
│   ├── settings/                          # ConfigurationPanel, MasterTable
│   └── users/                             # UsersTable, UserModal
└── store/
    ├── store.ts                           # Redux Root Store
    └── services/                          # RTK Query Services (api.ts, examsApi.ts)
```

---

## 5. UI/UX Standards & Canonical Design Tokens

- **Color Tokens (Tailwind CSS v4 & CSS Variables)**:
  - Surface Backgrounds: `bg-surface-base` (`#0c0f17`), `bg-surface-1` (`#121624`), `bg-surface-2` (`#181d2f`), `bg-surface-3` (`#22283f`).
  - Borders: `border-border-default`, `border-border-soft`, `border-border-strong`.
  - Accents: `accent-indigo` (`#6366f1`), `accent-cyan` (`#06b6d4`), `accent-green` (`#10b981`), `accent-orange` (`#f59e0b`).
- **Interactive Element Rules**:
  - **Dropdowns & Selects**: Always use `rounded-xl` with `h-10 px-3.5` and `text-xs`.
  - **Paginator**: Re-exported from `@/features/shared` (`TablePagination`) with active page buttons in `bg-accent-indigo text-white size-8`.
  - **Micro-interactions**: Framer motion buttons with `hover:scale-[1.02] active:scale-95`.

---

## 6. Living Architectural Invariants (DO NOT VIOLATE)

1. **Master Data Single Truth**:
   - Locations are managed exclusively under **`hiringlocations`** (`MasterHiringLocations`). Test locations are consolidated into hiring locations.
2. **Form Single Date vs Filter Date Range**:
   - Forms (`DOB`, `Offer Joining Date`, `Drive Date`) MUST ALWAYS use **`CustomCalendarPicker`** (Single-date).
   - Filter bars & reports MUST ALWAYS use **`CustomDateRangePicker`** (Range with Presets).
3. **Table Row Click vs Actions**:
   - Clicking a candidate row navigates to the Candidate Profile (`/dashboard/candidates/{id}`).
   - The action button triggers the **Candidate Progress Stepper Modal** without page navigation.
4. **Anti-Cheat Enforcement**:
   - Server-side auto-submission on 3 tab switches / proctoring strikes.
   - Assessment integrity score drops by 10% on each violation ping.

---

## 7. Change Log & Maintenance Protocol

- **2026-08-24**: Standardized `TablePagination` across `MasterTable`, `UsersTable`, `CandidateWorkspace`, and `VacancyCandidatesTab`.
- **2026-08-24**: Consolidated `TEST LOCATION` into `HIRING LOCATION`; freed table width and expanded `EMAIL`, `ROLE`, and `CANDIDATE` columns.
- **2026-08-24**: Unified Candidate Table header toolbar into a single-line command bar with inline filter dropdowns.
- **2026-08-24**: Built `CustomDateRangePicker` with quick presets (`Today`, `7 Days`, `30 Days`, `This Month`) and 1:1 `CustomSelect` visual harmonization.
- **2026-08-30**: Created `PROCTORING_CAMERA_MIC_SPECIFICATION.md` for AI audio/video proctoring and initialized `CODEBASE_MASTER_AUDIT.md`.
- **2026-08-31**: Created `UNIVERSAL_QR_REGISTRATION_SPECIFICATION.md` for Universal QR open registration & smart vacancy auto-matching (0 DB changes required).

---

## 8. Universal Candidate Registration & Smart Auto-Matching System

### 8.1 Architecture & Problem Solved

Previously, candidates registered via unique campaign-specific URLs (`/apply/[code]`), requiring HR to print new QR codes for every single drive or job opening.

The **Universal Registration Portal** (`/apply`) introduces a permanent, single enterprise QR code that can be printed once at office reception, posted on LinkedIn, or featured on the careers portal.

### 8.2 Smart Auto-Matching Resolution Ladder

When a candidate submits their application at `/apply`:

```
[Candidate Submits Form at /apply]
         │
         ▼
[Step 1: Resolve Master Role & Hiring Location]
Resolve MasterRoleId and MasterHiringLocationId from dynamic dropdown selections.
         │
         ▼
[Step 2: Query Active Matching Vacancy]
Find active vacancy where:
  • MasterRoleId == request.RoleId
  • HiringLocationId == request.LocationId
  • DriveType == request.Channel ("Walk-in" vs "Direct")
  • Status == "Active"
         │
         ├───────────────────────────────┐
         │ Found Exact Match             │ No Match Found
         ▼                               ▼
[Attach Candidate to Vacancy]   [Step 3: Fallback Role Match]
                                Find any active vacancy for RoleId & Status == "Active"
                                         │
                                         ├───────────────────────────────┐
                                         │ Found Fallback                │ No Vacancies Exist
                                         ▼                               ▼
                                [Attach to Fallback Vacancy]    [Step 4: Auto-Provision Vacancy]
                                                                Creates standard active vacancy
                                                                with canonical 3-round flow
         │
         ▼
[Step 5: 90-Day Candidate Cooldown Check]
Checks if candidate (Email / Phone) applied for the same role within 90 days.
If within cooldown, rejects with exact eligible re-application date.
         │
         ▼
[Step 6: Initialize Candidate & Pipeline Progress]
  • Generate sequential code: CND-{YYYY}-{Sequence} (dynamically resolved)
  • For Walk-in: Hashes default passcode "1234" via IPasswordHasher; initializes Round 1 Progress ("Ready")
  • For Direct: Initializes Round 1 HR Sourcing & Screening ("Pending")
  • Saves Profile Photo & Resume Base64 documents to IFileStorageService
  • Returns Candidate Code, Exam Passcode ("1234"), and Exam Portal URL (/exam?code=...&pass=1234)
```

### 8.3 Endpoints & Controllers

- `POST /api/apply/universal` & `POST /api/publicregistration/universal` ([`PublicRegistrationController.cs`](file:///home/adibhange/Downloads/STEP/backend/STEP.Api/Controllers/PublicRegistrationController.cs#L45-L51))
- `POST /api/candidates/register-universal` ([`CandidatesController.cs`](file:///home/adibhange/Downloads/STEP/backend/STEP.Api/Controllers/CandidatesController.cs#L44-L51))
- CQRS: [`RegisterUniversalCandidateCommand`](file:///home/adibhange/Downloads/STEP/backend/STEP.Application/Features/QR/Commands/RegisterUniversalCandidate/RegisterUniversalCandidateCommand.cs) + [`RegisterUniversalCandidateCommandHandler`](file:///home/adibhange/Downloads/STEP/backend/STEP.Application/Features/QR/Commands/RegisterUniversalCandidate/RegisterUniversalCandidateCommandHandler.cs) + [`RegisterUniversalCandidateCommandValidator`](file:///home/adibhange/Downloads/STEP/backend/STEP.Application/Features/QR/Commands/RegisterUniversalCandidate/RegisterUniversalCandidateCommandValidator.cs)
- Frontend: [`frontend/src/app/apply/page.tsx`](file:///home/adibhange/Downloads/STEP/frontend/src/app/apply/page.tsx) + [`frontend/src/store/services/candidatesApi.ts`](file:///home/adibhange/Downloads/STEP/frontend/src/store/services/candidatesApi.ts#L166-L174)

---

## 9. Interview Notification, Email Dispatch & Teams Bridge Architecture

- **Specification**: [`docs/INTERVIEWER_NOTIFICATION_SPECIFICATION.md`](file:///home/adibhange/Downloads/STEP/docs/INTERVIEWER_NOTIFICATION_SPECIFICATION.md)
- **Central Sender Email**: `Recruitment@sthapatya.in` (Single source of truth in `appsettings.json` under `EmailSettings`).
- **Multi-Address Support**: Central `DefaultCc` and `DefaultBcc` for organization tracking + dynamic `Reply-To` set to the logged-in HR recruiter.
- **Interview Modes**: Dynamic `Mode` flag (`"Face-to-Face"` vs `"Online"`).
- **Channels**:
  1. **Candidate Email Invitation**: Branded HTML invitation with date/time, round details, video meeting link (if Online), and attached `.ics` calendar file.
  2. **Interviewer Briefing Email**: On-site or online briefing with 1-click candidate dossier & scorecard link.
  3. **1-Click Microsoft Teams Direct Chat Launcher**: Protocol URL `https://teams.microsoft.com/l/chat/0/0?users={email}&message={briefing}`.
  4. **Outbox Resilience**: Guaranteed delivery via `OutboxMessage`.

---

_Protocol: Every future modification to STEP must be preceded by reviewing this document and followed by updating its entries._
