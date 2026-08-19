# STEP Enterprise ATS — V2 Master Execution Checklist

> **Living Execution Matrix**: Tracks end-to-end task progression strictly following the **FRONTEND-FIRST** workflow: Design & Build UI $\rightarrow$ User Review & UI Testing $\rightarrow$ Update Backend Contract $\rightarrow$ Backend & Live Database Execution.

---

## Phase 0: Frontend / Product Design

| Task ID | Feature Area | Design Scope | Status | Notes |
|---|---|---|---|---|
| `V2-DES-001` | Role Hiring Profiles | Experience-tier matrix blueprints (*Fresher*, *1-2 Yrs*, *2-4 Yrs*, *Senior*) | **COMPLETED** | Fully mapped |
| `V2-DES-002` | Section Rule Builder | Relational multi-section rules (MCQ, SQL, Coding, Subjective) | **COMPLETED** | Relational model approved |
| `V2-DES-003` | Question Pool Status | Live visual indicator (`Ready ✓` vs `Deficit ✕` with missing count) | **COMPLETED** | Pre-flight check designed |
| `V2-DES-004` | 1-Click Drive Launch | Zero-touch modal with live QR display & candidate link | **COMPLETED** | Instant drive flow designed |
| `V2-DES-005` | Dynamic Exam Portal | Multi-section tabs, IDE/SQL runner, timer, offline buffer | **COMPLETED** | Offline-resilient UI designed |
| `V2-DES-006` | Dual Pipelines | Walk-in (Round 1 Aptitude) vs. Invited (Round 1 HR Screening Auto-Pass) | **COMPLETED** | Stage progression mapped |

---

## Phase 1: Frontend Implementation (COMPLETED & UI FROZEN)

| Task ID | Component / View | Frontend Deliverable | Backend Dependency | Status | Notes |
|---|---|---|---|---|---|
| `V2-FE-001` | `RoleHiringProfilesManager.tsx` | Role search for 50+ designations, profile tier cards, edit modal | `FEAT-V2-01` | **COMPLETED & APPROVED** | 50+ role search & Framer Motion |
| `V2-FE-002` | `RoleAssessmentSectionRuleBuilder` | Section composition editor (Question count, difficulty, tags, time, language) | `FEAT-V2-01` | **COMPLETED & APPROVED** | Integrated in Profile Modal |
| `V2-FE-003` | `PoolStatusIndicator` | Visual banner showing `Pool: Ready ✓ (Need: N / Available: M)` | `FEAT-V2-01` | **COMPLETED & APPROVED** | Real-time pool validation badge |
| `V2-FE-004` | `QuestionBankManager.tsx` | Central Question Bank management UI (Tags, MCQs, SQL, Coding, Bulk Actions, Excel .xlsx Template) | `FEAT-V2-02` | **COMPLETED & APPROVED** | Question bank explorer & bulk tooling complete |
| `V2-FE-005` | `InstantDriveModalV2.tsx` | 1-Click Drive Launch modal with pool verification, dual recruitment model toggle, custom selects, & full-width action button | `FEAT-V2-03` | **COMPLETED & APPROVED** | 1-Click Drive modal |
| `V2-FE-006` | `TempExamLinkModalV2.tsx` | 24-hour Spot Test Pass token generator for invited candidates | `FEAT-V2-03` | **COMPLETED & APPROVED** | Spot pass modal |
| `V2-FE-007` | `CandidateExamPortalV2.tsx` | Multi-section exam portal with MCQ, SQL, Coding IDE, offline buffer, anti-cheat, 30s transition modal | `FEAT-V2-04` | **COMPLETED & APPROVED** | Approved candidate test portal |
| `V2-FE-008` | `ApplyV2Page` (`/apply/v2/[code]`) | Candidate fast-track mobile registration page for instant drives | `FEAT-V2-03` | **COMPLETED & APPROVED** | Live candidate landing page |
| `V2-FE-009` | `VacancyDetailDialog.tsx` | Vacancy Hiring Hub with Overview, QR Hub / Direct Link, 10-item Paginated Candidates Roster & Canonical Progress Modal | `FEAT-V2-03` | **COMPLETED & APPROVED** | Unified Vacancy Detail modal |
| `V2-FE-010` | Centralized Motion System | `elasticDialogVariant`, `dialogBackdropVariant`, and theme-aware `--overlay` token across all modals | `N/A` | **COMPLETED & APPROVED** | Elastic spring bloom with smooth exit curves |

---

## Phase 2: Backend Requirements & Implementation Specification

| Task ID | Feature Contract | Target Living Document | Status | Notes |
|---|---|---|---|---|
| `V2-REQ-001` | Section Timing & Anti-Cheat Validation Rules | `docs/V2_BACKEND_REQUIREMENTS.md` (`FEAT-V2-06`) | **DOCUMENTED** | Sequential locking, 30s transition modal, 3 tab warnings limit |
| `V2-REQ-002` | Hiring Profiles & Section Rules API | `docs/V2_BACKEND_REQUIREMENTS.md` (`FEAT-V2-01`) | **DOCUMENTED** | DTOs, validations & SPs specified |
| `V2-REQ-003` | Central Question Bank API | `docs/V2_BACKEND_REQUIREMENTS.md` (`FEAT-V2-02`) | **DOCUMENTED** | Tagging & option schema specified |
| `V2-REQ-004` | 1-Click Drive & QR API | `docs/V2_BACKEND_REQUIREMENTS.md` (`FEAT-V2-03`) | **DOCUMENTED** | Atomic drive creation specified |
| `V2-REQ-005` | Dynamic Sampler & Snapshot API | `docs/V2_BACKEND_REQUIREMENTS.md` (`FEAT-V2-04`) | **DOCUMENTED** | Deterministic seeding specified |
| `V2-REQ-006` | Batch Sync & Auto-Grading API | `docs/V2_BACKEND_REQUIREMENTS.md` (`FEAT-V2-05`) | **DOCUMENTED** | Idempotent sync & sandbox scoring specified |

---

## Phase 3: Backend Implementation (.NET 10 Clean Architecture)
*(Ready for live database execution)*

| Task ID | Feature | Backend Deliverables | Database Dependency | Status | Notes |
|---|---|---|---|---|---|
| `V2-BE-001` | Domain Entities | `MasterQuestion.cs`, `MasterQuestionOption.cs`, `RoleAssessmentSectionRule.cs` | Identity primary keys | **STAGED IN CODE** | Awaiting UI freeze |
| `V2-BE-002` | Session Explicit Source | Update `CandidateExamSession.cs` (`AssessmentSource`, `RoleHiringProfileId`) | Nullable paper ID | **STAGED IN CODE** | Awaiting UI freeze |
| `V2-BE-003` | Dynamic Sampler Service | `IDynamicQuestionSampler` & `DynamicQuestionSampler.cs` | Pool validation | **STAGED IN CODE** | Awaiting UI freeze |
| `V2-BE-004` | Hiring Profiles CQRS | `GetRoleHiringProfilesQuery`, `CreateRoleHiringProfileCommand`, `UpdateRoleHiringProfileCommand` | Section rules mapping | **STAGED IN CODE** | Awaiting UI freeze |
| `V2-BE-005` | Dynamic Exam Start CQRS | `StartExamSessionV2Command` (Pool check $\rightarrow$ Sample $\rightarrow$ Freeze snapshot) | Locked snapshot | **PLANNED** | Next slice |
| `V2-BE-006` | Batch Sync & Auto-Grade CQRS | `SaveExamAnswerBatchCommand`, `PublishAssessmentResultV2Command` | Auto-advancement | **STAGED IN CODE** | Awaiting UI freeze |
| `V2-BE-007` | REST API Controllers | `VacanciesController.cs`, `ExamsController.cs`, `QRCodesController.cs` under `v2` | BaseApiControllerV2 | **STAGED IN CODE** | Awaiting UI freeze |

---

## Phase 4: Database & Stored Procedures (SQL Server Live Migrations)
*(To be executed only after live database connection & UI freeze)*

| Task ID | Stored Procedure / Config | Database Deliverable | Identity Generated | Status | Notes |
|---|---|---|---|---|---|
| `V2-DB-001` | EF Core Fluent Configurations | `RoleAssessmentSectionRuleConfiguration.cs`, `MasterQuestionConfiguration.cs` | `IDENTITY(1,1)` | **PLANNED** | ModelBuilder configured |
| `V2-DB-002` | DbContext Registration | `IApplicationDbContext.cs` & `ApplicationDbContext.cs` | DbSets | **PLANNED** | DbSets declared |
| `V2-DB-003` | `sp_V2_CreateRoleHiringProfile` | Atomically creates profile & sets default flags | `RoleHiringProfiles.Id` | **PLANNED** | Awaiting live DB |
| `V2-DB-004` | `sp_V2_SaveAssessmentSectionRules` | Upserts relational section rules | `RoleAssessmentSectionRules.Id`| **PLANNED** | Awaiting live DB |
| `V2-DB-005` | `sp_V2_GetAssessmentPoolStatus` | Evaluates live Question Bank availability per rule | Read Query | **PLANNED** | Awaiting live DB |
| `V2-DB-006` | `sp_V2_AddMasterQuestion` | Inserts question bank item and options | `MasterQuestions.Id` | **PLANNED** | Awaiting live DB |
| `V2-DB-007` | `sp_V2_BulkDeleteQuestions` | Atomically bulk deletes questions & options | Rows deleted | **PLANNED** | Awaiting live DB |
| `V2-DB-008` | `sp_V2_BulkUpdateQuestionStatus` | Atomically bulk activates/deactivates questions | Rows updated | **PLANNED** | Awaiting live DB |
| `V2-DB-009` | `sp_V2_CreateDynamicExamSession` | Deterministic sampler & locked snapshot | `CandidateExamSessions.Id` | **PLANNED** | Awaiting live DB |
| `V2-DB-010` | `sp_V2_SaveExamAnswerBatch` | Idempotent batch answer sync | `CandidateExamAnswers.Id` | **PLANNED** | Awaiting live DB |
| `V2-DB-011` | Database Seed Data | 80+ seed questions across Aptitude, .NET, React, SQL, Algorithms | MasterDataSeedData | **PLANNED** | Not yet applied to live SQL DB |

---

## Phase 5: Integration

| Task ID | Integration Scope | Deliverable | Status | Notes |
|---|---|---|---|---|
| `V2-INT-001` | RTK Query Service Endpoints | `frontend/src/store/services/api.ts` V2 endpoints & types | **COMPLETED** | RTK hooks live |
| `V2-INT-002` | In-Browser Mock DB Layer | `frontend/src/mock-data/mockDbService.ts` V2 request router | **COMPLETED** | Standalone developer UI preview |
| `V2-INT-003` | Real Backend Connection | Test end-to-end against live SQL Server API | **PLANNED** | When DB is connected |

---

## Phase 6: Testing & Verification

| Task ID | Test Scope | Verification Method | Status | Notes |
|---|---|---|---|---|
| `V2-TST-001` | Backend Build & Compilation | `dotnet build backend/STEP.sln` | **VERIFIED** | 0 errors |
| `V2-TST-002` | Frontend TypeScript Compilation | `cd frontend && npx tsc --noEmit` | **VERIFIED** | 0 errors |
| `V2-TST-003` | Pre-Flight Pool Validation Check | Test pool status warning when available < required | **PLANNED** | UI preview ready |
| `V2-TST-004` | Deterministic Sampling & Shuffling | Verify Candidate A and Candidate B receive distinct papers | **PLANNED** | Deterministic logic |
| `V2-TST-005` | Walk-in vs. Invited Dual Pipeline | Test 4-round walk-in drive & 4-round invited spot pass | **PLANNED** | UI preview ready |

---

## Phase 7: V1 Compatibility Verification

| Task ID | Compatibility Scope | Verification Method | Status | Notes |
|---|---|---|---|---|
| `V2-CMP-001` | V1 Manual Vacancy Creation | Create vacancy with manual paper and pipeline via `/api/v1/vacancies` | **VERIFIED** | 100% operational |
| `V2-CMP-002` | V1 Static Question Papers | Open and edit legacy question papers via `/api/v1/questionpapers` | **VERIFIED** | 100% operational |
| `V2-CMP-003` | V1 Candidate Exam Sessions | Start and submit exam using static paper ID | **VERIFIED** | 100% operational |
