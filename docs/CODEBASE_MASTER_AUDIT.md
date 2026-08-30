# STEP Enterprise Platform — Codebase Master Architecture Registry & Live Audit

**Document:** `docs/CODEBASE_MASTER_AUDIT.md`  
**System Name:** STEP (Sthapatya Talent Excellence Platform)  
**Enterprise:** SCIPL (Sthapatya Consultants India Pvt. Ltd.)  
**Current Version:** 2.4.0 (Enterprise Production Architecture)  
**Last Synchronized:** 2026-08-30  
**Rule:** *This document is the authoritative single source of truth. It MUST be consulted before making code changes and updated immediately after any architectural or feature modifications.*

---

## 1. System Overview & Technology Matrix

| Layer | Technology / Framework | Key Libraries & Standards |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14+ (App Router)** | React 18, TypeScript (Strict Mode) |
| **Styling & Design System** | **Tailwind CSS v4** | CSS Variables Theme Tokens, Radix UI Primitives, Lucide Icons |
| **Animation & UI Micro-interactions** | **Framer Motion 11+** | Kinetic feedback, slide transitions, spring physics |
| **Client State & Network Cache** | **Redux Toolkit + RTK Query** | Tag-based cache invalidation, typed queries & mutations |
| **Backend Core** | **.NET 8 (C# 12)** | Clean Architecture (Domain, Application, Persistence, Infrastructure, Api) |
| **CQRS & Mediator Pattern** | **MediatR 12+** | Isolated Queries, Commands, Pipeline Behaviors, FluentValidation |
| **Database & ORM** | **Microsoft SQL Server / Azure SQL** | Entity Framework Core 8, Code-First Migrations, Isolated Schemas |
| **Auth & Security** | **JWT Bearer + Director 4-Digit PIN** | ASP.NET Identity, PBKDF2/Argon2 PIN hashing, CORS policies |

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
   * `MasterRoles`: Canonical enterprise designations (e.g. *Senior .NET Core Architect*, *QA Lead*).
   * `MasterDepartments`: Business units (*Engineering*, *QA*, *DevOps*, *Human Resources*).
   * `MasterHiringLocations`: Official company locations (*Pune Center*, *Mumbai HQ*, *Bengaluru*).
   * `MasterEmploymentTypes`: Work contracts (*Full-time*, *Contract*, *Internship*).
   * `MasterExperienceLevels`: Seniority brackets (*Fresher*, *1-3 Yrs*, *3-5 Yrs*, *5+ Yrs*).
2. **`identity` Schema**:
   * `Users`: Enterprise admins, HR recruiters, interviewers, directors.
   * `Roles` / `UserRoles`: Role-based access control permissions.
3. **`vacancy` Schema**:
   * `Vacancies`: Hiring campaigns with hiring location, role, department, open positions, and status (`Active`, `Draft`, `Closed`).
   * `VacancyRounds`: Configured hiring stages (e.g., Round 1: *Aptitude/Technical Assessment*, Round 2: *Technical Interview*, Round 3: *Director Round*).
   * `VacancyInterviewers`: Assigned interviewers and stage evaluators.
4. **`candidate` Schema**:
   * `Candidates`: Master candidate profile (`Code`, `Name`, `Email`, `Phone`, `CurrentLocation`, `ResumeUrl`, `RegistrationChannel` [Direct/WalkIn]).
   * `CandidatePipelineProgress`: Live round progression tracker (`CurrentRoundId`, `RoundStatus` [Scheduled, In-Progress, Passed, Failed], `InterviewerId`).
   * `CandidateEvaluationRatings`: Detailed scoring rubrics per interview round.
5. **`examv2` Schema**:
   * `AssessmentBlueprints`: Reusable test blueprints with rule sections, question counts, difficulty, and pass cutoffs.
   * `CandidateExamSessionsV2`: Immutable snapshot of a candidate's exam attempt (`SessionToken`, `IntegrityScore`, `TabSwitchCount`, `TotalScore`, `ResultStatus` [Pass/Fail]).
   * `CandidateExamSessionQuestionsV2` / `Options`: Frozen test questions.
   * `CandidateExamAnswersV2`: Submitted candidate code, SQL queries, and MCQ choices.
   * `ExamProctoringLogs` & `ExamProctoringSnapshots`: Tab-switch incidents, audio spikes, and webcam frames.

---

## 3. Backend CQRS & API Endpoint Directory

### 3.1 Authentication (`STEP.Api/Controllers/AuthController.cs`)
* `POST /api/auth/login`: Standard corporate email & password JWT authentication.
* `POST /api/auth/director-pin`: 4-digit PIN access for instant Director evaluation mode.
* `POST /api/auth/refresh-token`: Session token renewal.

### 3.2 Candidates (`STEP.Api/Controllers/CandidatesController.cs`)
* `GET /api/candidates`: Query handler with stage, role, location, status, and date-range filtering.
* `GET /api/candidates/{id}`: Full candidate 360° profile with pipeline history and documents.
* `POST /api/candidates`: Manual candidate registration (HR form).
* `POST /api/candidates/public-register`: Public walk-in QR code registration.
* `POST /api/candidates/{id}/advance-stage`: Advances candidate to the next hiring round.
* `POST /api/candidates/{id}/reject`: Archives/rejects candidate with reason.

### 3.3 Vacancies & Campaigns (`STEP.Api/Controllers/VacanciesController.cs`)
* `GET /api/vacancies`: List all campaigns with real-time candidate count and fulfillment %.
* `GET /api/vacancies/{id}`: Detailed vacancy campaign view with assigned rounds & candidates.
* `POST /api/vacancies`: Create new vacancy campaign.
* `PUT /api/vacancies/{id}`: Update vacancy details, requirements, and hiring targets.
* `POST /api/vacancies/instant-drive`: Generate Instant Walk-in Drive QR code and link.

### 3.4 Examination & Proctoring (`STEP.Api/Controllers/ExamsController.cs`)
* `POST /api/exams/session/start`: Validates candidate passcode & returns frozen test workspace.
* `POST /api/exams/session/answers`: Batched auto-save for MCQ answers, SQL, and code editor.
* `POST /api/exams/session/submit`: Final submission & automated grading engine.
* `POST /api/exams/session/violation`: Reports tab-switch, audio spike, or camera violation (3-strike rule).

### 3.5 Master Data & Users (`STEP.Api/Controllers/MasterDataController.cs`, `UsersController.cs`)
* `GET /api/master-data/{category}`: Dynamic master data loader (`roles`, `departments`, `hiringlocations`, etc.).
* `POST /api/master-data/{category}` / `PUT /api/master-data/{category}/{id}`: Master CRUD.
* `GET /api/users` / `POST /api/users`: Enterprise user & interviewer management.

---

## 4. Frontend Route & Component Architecture

```
frontend/src/
├── app/
│   ├── page.tsx                           # Login / Director Mode Entry
│   ├── apply/[code]/page.tsx              # Public Walk-in Candidate Registration
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

* **Color Tokens (Tailwind CSS v4 & CSS Variables)**:
  * Surface Backgrounds: `bg-surface-base` (`#0c0f17`), `bg-surface-1` (`#121624`), `bg-surface-2` (`#181d2f`), `bg-surface-3` (`#22283f`).
  * Borders: `border-border-default`, `border-border-soft`, `border-border-strong`.
  * Accents: `accent-indigo` (`#6366f1`), `accent-cyan` (`#06b6d4`), `accent-green` (`#10b981`), `accent-orange` (`#f59e0b`).
* **Interactive Element Rules**:
  * **Dropdowns & Selects**: Always use `rounded-xl` with `h-10 px-3.5` and `text-xs`.
  * **Paginator**: Re-exported from `@/features/shared` (`TablePagination`) with active page buttons in `bg-accent-indigo text-white size-8`.
  * **Micro-interactions**: Framer motion buttons with `hover:scale-[1.02] active:scale-95`.

---

## 6. Living Architectural Invariants (DO NOT VIOLATE)

1. **Master Data Single Truth**:
   * Locations are managed exclusively under **`hiringlocations`** (`MasterHiringLocations`). Test locations are consolidated into hiring locations.
2. **Form Single Date vs Filter Date Range**:
   * Forms (`DOB`, `Offer Joining Date`, `Drive Date`) MUST ALWAYS use **`CustomCalendarPicker`** (Single-date).
   * Filter bars & reports MUST ALWAYS use **`CustomDateRangePicker`** (Range with Presets).
3. **Table Row Click vs Actions**:
   * Clicking a candidate row navigates to the Candidate Profile (`/dashboard/candidates/{id}`).
   * The action button triggers the **Candidate Progress Stepper Modal** without page navigation.
4. **Anti-Cheat Enforcement**:
   * Server-side auto-submission on 3 tab switches / proctoring strikes.
   * Assessment integrity score drops by 10% on each violation ping.

---

## 7. Change Log & Maintenance Protocol

* **2026-08-24**: Standardized `TablePagination` across `MasterTable`, `UsersTable`, `CandidateWorkspace`, and `VacancyCandidatesTab`.
* **2026-08-24**: Consolidated `TEST LOCATION` into `HIRING LOCATION`; freed table width and expanded `EMAIL`, `ROLE`, and `CANDIDATE` columns.
* **2026-08-24**: Unified Candidate Table header toolbar into a single-line command bar with inline filter dropdowns.
* **2026-08-24**: Built `CustomDateRangePicker` with quick presets (`Today`, `7 Days`, `30 Days`, `This Month`) and 1:1 `CustomSelect` visual harmonization.
* **2026-08-30**: Created `PROCTORING_CAMERA_MIC_SPECIFICATION.md` for AI audio/video proctoring and initialized `CODEBASE_MASTER_AUDIT.md`.

---
*Protocol: Every future modification to STEP must be preceded by reviewing this document and followed by updating its entries.*
