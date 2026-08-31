# STEP Enterprise Platform — Universal QR Registration & Smart Vacancy Auto-Linking Specification

**Document:** `docs/UNIVERSAL_QR_REGISTRATION_SPECIFICATION.md`  
**Target Capability:** Universal Registration Portal (`/apply`), Dynamic Role/Location Selection, and Smart Vacancy Auto-Matching  
**Status:** Architecture Blueprint (Design Phase)  
**Database Changes Required:** **NONE (0 Schema / 0 Table Changes)**  
**Author:** Antigravity AI & STEP Engineering Team

---

## 1. Executive Summary

### The Challenge Today:

- Currently, candidates register via a unique, campaign-specific URL/QR code: `/apply/[code]` (e.g. `/apply/VAC-2026-1001` or `/apply/DRV-PUNE-01`).
- This requires HR/Recruiters to create a new Vacancy and print a brand-new QR code for every single job opening or drive.

### The Universal Solution:

- **One Universal QR Code & Permanent Link**: `https://step.sci-pl.com/apply` (printed once at the office reception, displayed on the company careers site, or shared on LinkedIn).
- **Dynamic Smart Intake Form**: When candidates scan this Universal QR, the form dynamically loads all active enterprise Roles and Hiring Locations.
- **Smart Vacancy Auto-Matching Engine**: On submission, the backend automatically finds the matching active `Vacancy` by `(RoleId, LocationId, DriveType, ExperienceYears)`, binds the candidate to that Vacancy, and immediately attaches the corresponding hiring pipeline flow.

---

## 2. Database Audit: Why 0 DB Changes Are Required

An audit of the current database entities reveals that the existing SQL Server schema **already contains 100% of the required data models and relationships**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   EXISTING DATABASE TABLES (NO CHANGES)                │
├────────────────────────────────┬───────────────────────────────────────┤
│ TABLE                          │ EXISTING KEY COLUMNS USED BY ENGINE   │
├────────────────────────────────┼───────────────────────────────────────┤
│ `master.MasterRoles`           │ Id, Name, Code, IsActive              │
│ `master.MasterHiringLocations` │ Id, Name, Code, IsActive              │
│ `vacancy.Vacancies`            │ Id, MasterRoleId, HiringLocationId,   │
│                                │ DriveType ("Walk-in"/"Direct"),       │
│                                │ MinExperienceYears, MaxExperienceYears│
│                                │ Status ("Active"), PipelineFlows      │
│ `candidate.Candidates`         │ Id, VacancyId, CandidateCode, Name,   │
│                                │ RegistrationChannel, TotalExpYears    │
│ `candidate.CandidatePipelineProgress` │ CandidateId, FlowRoundId,      │
│                                │ Status, RoundType, TestPasscode       │
└────────────────────────────────┴───────────────────────────────────────┘
```

> [!NOTE]
> Because all relationships (`VacancyId`, `MasterRoleId`, `HiringLocationId`, `RegistrationChannel`, and `PipelineFlows`) are already fully modeled in EF Core, this feature is achieved purely through backend application logic. **Zero database migrations are needed.**

---

## 3. Handling Dual Tracks: "Direct / Sourced" vs. "Walk-in"

A role (e.g., _Senior .NET Core Architect_) can have candidates applying via two different tracks with different hiring workflows:

| Attribute              | Track A: Walk-in Drive                                 | Track B: Direct / Portal Sourced                            |
| :--------------------- | :----------------------------------------------------- | :---------------------------------------------------------- |
| **Candidate Location** | Physically present at company office / test center     | Applying remotely from home / LinkedIn / Referral           |
| **Round 1 Action**     | Takes immediate Proctored Assessment on-site           | HR reviews resume; Round 1 test is auto-passed or scheduled |
| **Pipeline Flow**      | `Walk-in Elimination Flow` (generates passcode `1234`) | `Direct Sourced Flow` (auto-passes screening)               |
| **Dashboard Tag**      | `WALK-IN` (Green badge)                                | `DIRECT SOURCED` (Cyan badge)                               |

### How the Universal Form Resolves the Track:

1. **Context-Aware QR Codes (Automatic)**:
   - **Reception Desk QR Code** ➔ URL: `/apply?channel=walkin` (Form defaults to **Walk-in**).
   - **LinkedIn / Website Link** ➔ URL: `/apply?channel=direct` (Form defaults to **Direct**).
2. **Interactive Form Switcher (When scanned directly via `/apply`)**:
   - The candidate sees an intuitive, modern 2-way toggle at the top of the form:
     ```
     Application Stream:
     [ 🏢 Walk-in (At Office Today) ]    [ 🌐 Direct Online Application ]
     ```

---

## 4. Smart Auto-Matching Algorithm (Backend Workflow)

When the candidate submits the Universal Form, the backend executes the following resolution ladder:

```
[Candidate Submits Form]
         │
         ▼
[Query 1: Exact Active Vacancy Match]
Find active vacancy where:
  • MasterRoleId == request.RoleId
  • HiringLocationId == request.LocationId
  • DriveType == request.Channel ("Walk-in" or "Direct")
  • Status == "Active"
         │
         ├───────────────────────────────┐
         │ Found Exact Match             │ No Match Found
         ▼                               ▼
[Attach Candidate to Vacancy]   [Query 2: Fallback Role Match]
                                Find any active vacancy for RoleId & Status == "Active"
                                         │
                                         ├───────────────────────────────┐
                                         │ Found Fallback                │ No Vacancies Exist
                                         ▼                               ▼
                                [Attach to Fallback Vacancy]    [Auto-Provision Default Vacancy]
                                                                Creates standard active vacancy
                                                                with canonical 3-round flow
         │
         ▼
[Initialize Candidate Record]
  • Generate sequential code: `CND-2026-XXXX`
  • Set `RegistrationChannel` = "Walk-in" or "Direct Sourced"
  • Attach Round 1 `CandidatePipelineProgress`
  • Return Candidate Code & Exam Access Details
```

---

## 5. Backend API Specification

### `POST /api/candidates/universal-register`

- **Route:** `/api/candidates/universal-register`
- **Access:** Public (CORS allowed, rate-limited)
- **Request Payload (JSON or Multipart Form):**
  ```json
  {
  	"roleId": 3,
  	"hiringLocationId": 1,
  	"channel": "Walk-in",
  	"candidateType": "Experienced",
  	"firstName": "Siddharth",
  	"lastName": "Kulkarni",
  	"email": "siddharth.k@example.com",
  	"phone": "9876543210",
  	"gender": "Male",
  	"dob": "1998-07-20",
  	"currentLocation": "Pune",
  	"qualification": "B.Tech / B.E.",
  	"collegeName": "COEP Pune",
  	"passingYear": "2020",
  	"cgpaOrPercentage": "82%",
  	"totalExperienceYears": 4.5,
  	"currentCompany": "Cognizant",
  	"currentDesignation": "Senior Software Engineer",
  	"currentCtc": 12.5,
  	"expectedCtc": 16.0,
  	"noticePeriodDays": 30,
  	"referralType": "Direct",
  	"referralEmployeeName": null
  }
  ```
- **Response (200 OK):**
  ```json
  {
  	"success": true,
  	"data": {
  		"candidateId": 108,
  		"candidateCode": "CND-2026-1009",
  		"matchedVacancyId": 14,
  		"vacancyTitle": "Senior .NET Core Architect",
  		"hiringLocation": "Pune Center (Hinjawadi)",
  		"driveType": "Walk-in",
  		"assignedRound": "Round 1: Technical & Aptitude Assessment",
  		"testPasscode": "1234",
  		"examPortalUrl": "/exam?code=CND-2026-1009&pass=1234"
  	}
  }
  ```

---

## 6. Frontend Form Specifications (`frontend/src/app/apply/page.tsx`)

### 6.1 Route Structure

```
frontend/src/app/apply/
├── page.tsx                  # NEW: Universal Application Portal (Single QR / Open Registration)
└── [code]/
    └── page.tsx              # EXISTING: Specific Vacancy Campaign Registration (100% Preserved)
```

### 6.2 Complete Step-by-Step Form Layout & UI Elements

The Universal Form is structured into clean, modern visual sections using our `@/design-system` tokens:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      UNIVERSAL REGISTRATION FORM                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. TOP HEADER & APPLICATION TRACK SWITCHER                                  │
│    [ 🏢 Walk-in (At Office Today) ]    [ 🌐 Direct Online Application ]     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. TARGET ROLE & LOCATION (NEW AUTO-MATCHING SELECTORS)                     │
│    • Target Role: [ CustomSelect: Senior .NET Architect, QA Lead, etc. ▾ ]  │
│    • Office Center: [ CustomSelect: Pune (Hinjawadi), Mumbai HQ, etc. ▾ ]   │
│    • Candidate Type: [ (•) Fresher (0-1 Yrs)    ( ) Experienced (1+ Yrs) ]  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PERSONAL & CONTACT DETAILS                                               │
│    • First Name & Last Name (Alpha regex validation)                        │
│    • Corporate / Personal Email (Strict email validation)                   │
│    • Mobile Number (10-digit Indian phone regex: ^[6-9]\d{9}$)              │
│    • Gender (Male / Female / Other)                                         │
│    • Date of Birth (Using CustomCalendarPicker)                             │
│    • Current City / Residing Location                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. ACADEMICS & QUALIFICATION                                                │
│    • Highest Qualification (B.Tech/B.E., M.Tech, BCA/MCA, B.Sc/M.Sc, Other) │
│    • College / Institute Name                                               │
│    • Year of Graduation / Passing (2026 Appearing, 2025, 2024, etc.)        │
│    • Aggregate Score (% or CGPA)                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. PROFESSIONAL EXPERIENCE (Conditioned on "Experienced")                   │
│    • Total Experience in Years (e.g. 3.5 Yrs)                               │
│    • Current Company / Organization                                         │
│    • Current Designation / Job Title                                        │
│    • Current CTC (LPA) & Expected CTC (LPA)                                 │
│    • Notice Period in Days (Immediate, 15, 30, 60, 90 Days)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. REFERENCE & SOURCING CHANNEL                                             │
│    • Reference Type: [ Direct Application / Internal Referral / Agency ▾ ]  │
│    • Referring Employee Name (if Internal Referral)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. DOCUMENT & PROFILE UPLOADS                                               │
│    • 📸 Candidate Profile Photo (JPEG/PNG/WebP, max 2MB with live preview)  │
│    • 📄 Resume Document (PDF / DOCX, max 5MB with file size badge)          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 8. SUBMISSION & INSTANT ACTION SCREEN                                       │
│    • Generates Candidate Code: CND-2026-XXXX                                │
│    • Shows Matched Vacancy & Hiring Flow confirmation                       │
│    • For Walk-in Candidates: One-Click [ 🚀 Start Proctored Exam Now ] CTA   │
│      (Directly navigates to /exam with pre-filled candidate code & pass)    │
│    • For Direct Applicants: [ ✓ Application Submitted ] Confirmation Card   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Design System Invariants Used in the Form

- **Dropdowns**: Standardized `CustomSelect` (`rounded-xl`, `h-10 px-3.5`, `text-xs`, CSS variables theme).
- **Calendar**: Single-date `CustomCalendarPicker` for Date of Birth.
- **Buttons**: Framer motion interactive buttons with `hover:scale-[1.01] active:scale-95`.
- **Instant Validation**: Real-time error banners and red field borders on invalid input.

---

## 7. Backward Compatibility & Non-Breaking Guarantee

1. **Existing Individual Vacancy QR URLs (`/apply/[code]`)**: Unchanged and fully operational.
2. **Current Vacancy Page (`/dashboard/vacancies`)**: Unchanged and fully operational.
3. **Candidate Table & Filters**: Automatically lists newly registered candidates under their matched role, location, and drive type (`WALK-IN` or `DIRECT`).
4. **Master Data & Settings**: Continues to manage enterprise roles and hiring locations seamlessly.

---

_Status: Specification ready. No database migrations required._
