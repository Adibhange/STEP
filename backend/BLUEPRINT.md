# STEP ATS — Phase 1 Implementation Rules

## IMPORTANT

You are implementing the backend for the existing STEP Enterprise ATS frontend.

The frontend is the single source of truth.

The architecture blueprint below is the implementation target, but **every backend API, entity, DTO, CQRS command, validation, and business rule must support the existing frontend exactly.**

## Superseded: Phase 0 Draft

An earlier draft scaffold (int-keyed entities, schema-per-domain SQL, 5 hand-written controllers) predated this blueprint and was fully deleted on 2026-08-04 in favor of a clean rebuild. Do not resurrect it from git history.

## FINAL Key Architectural Decisions (override the sections below where they conflict)

These were decided explicitly on 2026-08-04 (with two mid-build corrections the same day — see history below) and take precedence over anything below that contradicts them:

1. **Primary keys are `int IDENTITY(1,1)`, not GUID.** The blueprint text below still says "Use GUID primary keys" in a few places — ignore that.
2. **Every table's PK column is named `<TableNameSingular>Id`, not a generic `Id`.** e.g. `Users.UserId`, `Roles.RoleId`, `Vacancies.VacancyId`, `VacancyQuestionPapers.VacancyQuestionPaperId`. In C# the entity property is still just `Id` (inherited from `BaseEntity`) — only the physical SQL column name differs, mapped per-entity via `builder.Property(e => e.Id).HasColumnName("XxxId")` in each `IEntityTypeConfiguration`. Don't rename the C# property itself; that would ripple through every handler/DTO/controller for no benefit.
3. **Per-domain schemas, not one unified schema.** Each domain gets its own schema, matching (in spirit) the old deleted Phase 0 draft's layout:
   - `staff` — Users, UserRefreshTokens
   - `master` — Roles, Permissions, RolePermissions, MasterRoles, MasterDepartments, MasterHiringLocations, MasterTestLocations, MasterEmploymentTypes
   - `audit` — AuditLogs
   - `vacancy` — Vacancies, VacancyTestLocations, VacancyPipelineFlows, VacancyPipelineFlowRounds, VacancyAssessmentSections, VacancyRoundAssessments
   - `question` — VacancyQuestionPapers, VacancyQuestions, VacancyQuestionOptions
   - Future phases follow the same pattern: `candidate` for candidate tables, `exam` for exam-attempt tables, `interview` for interview tables, etc. — one schema per domain area, never a single catch-all schema.

**Correction history (so this doesn't get relitigated):** Phase 1 was originally built with GUID keys and a single `step` schema (per the original blueprint text below). Both were explicitly reversed by the user on 2026-08-04, in two separate corrections — first the single-schema decision was reversed to per-domain schemas, then the PK column naming was refined from a bare `Id` to `<Table>Id`. Each time, the live database was dropped and the migration regenerated from scratch (cheap because only seed data existed, never real user data). If you're tempted to "simplify" back to GUIDs or one schema or a generic `Id` column, don't — ask first.

## DO NOT

- Do not scaffold or inspect existing SQL Server tables.
- Do not reuse any existing database schema.
- Do not modify unrelated tables inside `InterviewTestPortal`.
- Do not create placeholder code.
- Do not skip validations.
- Do not invent frontend behavior.
- Do not implement future phases.
- Do not implement features that are not required by the current frontend.
- Do not generate all 30 entities at once.
- Do not generate all migrations at once.

## Database Rules

- Use EF Core Code First only.
- Create only our own STEP ATS tables.
- Prefix nothing.
- Use SQL Server 2022.
- Use `int IDENTITY(1,1)` primary keys, column named `<Table>Id` (see FINAL Key Architectural Decisions above — supersedes the original GUID guidance).
- Per-domain schemas — `staff`, `master`, `audit`, `vacancy`, `question`, and one per future domain (see FINAL Key Architectural Decisions above — supersedes the original "single schema" idea, which was itself a short-lived correction).
- Use Fluent API configurations.
- Use RowVersion where defined.
- Use proper indexes.
- Use foreign keys.
- Use cascade behaviors intentionally.
- Every migration must be reviewed before execution.

## Architecture Rules

Use:

- ASP.NET Core 10
- EF Core 10
- Clean Architecture
- CQRS (MediatR)
- FluentValidation
- AutoMapper
- Repository Pattern only where beneficial
- Unit of Work only where needed
- Serilog
- JWT Authentication
- Refresh Tokens
- Outbox Pattern

## Implementation Strategy

Implement one phase at a time.

After each phase:

1. Build the solution.
2. Fix all compile errors.
3. Verify migrations.
4. Verify API contracts.
5. Stop.
6. Wait for approval before moving to the next phase.

Never continue automatically.

## Frontend Compatibility

Every endpoint must map to the existing Next.js frontend.

If the frontend expects a different shape than the architecture, report it before implementing.

Never break frontend compatibility.

## Phase Breakdown

This list was corrected to match the detailed `PHASE 1`-`PHASE 6` sections earlier in this document (which originally disagreed with each other — the detailed sections already put Question Papers/Excel Import/Publishing inside Phase 2, this summary list used to split them into their own "Phase 3" and push everything else down one; the detailed sections win since they're more specific):

- **Phase 1:** Core Governance — Users, Roles, Authentication, JWT, Refresh Tokens, RBAC, Master Data.
- **Phase 2:** Vacancy Engine — Vacancies, Pipeline Flow, Assessment Sections, decoupled Round Assessments, Question Paper publishing/locking, Excel Import.
- **Phase 3:** Candidate Journey — Candidates, Pipeline Progression, Document Repository.
- **Phase 4:** Atomic Exam Snapshot, Evaluation, Result Publishing.
- **Phase 5:** Interview Scheduling, Outbox Queue, Director PIN Approvals, Offers.
- **Phase 6:** QR Code Walk-in Drive, Executive Funnel Analytics.

## Current Task

**Phase 1 is complete (2026-08-04):** Identity/RBAC (Users, Roles, Permissions, RolePermissions, UserRefreshTokens) under `staff`/`master` schemas, the five Master Data taxonomies under `master`, and AuditLogs under `audit` — all `int IDENTITY(1,1)` keys with `<Table>Id`-named PK columns, migrated to the live database. Frontend login screen (standard + Director PIN) is wired to the real `/auth/login` and `/auth/director-pin-login` endpoints.

**Phase 2 is complete (2026-08-04):** Vacancy Engine (`vacancy` schema: `Vacancies`, `VacancyTestLocations`, `VacancyPipelineFlows`, `VacancyPipelineFlowRounds`, `VacancyAssessmentSections`, `VacancyRoundAssessments`) and Question Paper publishing/locking (`question` schema: `VacancyQuestionPapers`, `VacancyQuestions`, `VacancyQuestionOptions`) — 9 tables, same PK conventions as Phase 1, migrated and verified end-to-end (create vacancy → create draft paper → import Excel → publish with the full validation checklist → confirm Published papers reject further edits). Frontend is NOT yet wired to these endpoints (`CreateVacancyModal.tsx` still saves locally) — that's the next frontend-integration task whenever it's picked up.

**Phase 3 is complete (2026-08-04):** Candidate Journey — `candidate` schema: `Candidates`, `CandidatePipelineProgress`, `CandidateDocuments`. `RegisterCandidateCommand` handles both Walk-in and Direct/Office registration (frontend doesn't structurally distinguish them — `RegistrationChannel` is the only difference). `AssignPipelineFlowCommand` creates the candidate's full round-by-round progress skeleton in one shot and points `CurrentPipelineProgressId` at round 1. `UploadCandidateDocumentCommand` enforces the frontend's exact 3-slot model (`Resume` / `Application Form` / `Profile Photo` — confirmed via `CandidateProfilePage.tsx`, not "ID Proof" as might be guessed) via `IFileStorageService` (local disk today, `CandidateDocument.StorageProvider` future-proofs a cloud swap). Verified end-to-end: register → assign flow → upload/reject documents → fetch full detail → filtered list. Test data cleaned up afterward.

Note: the frontend's own Candidate data model is inconsistent across 4+ different local type definitions with no canonical shape (`DashboardCandidate`, `CandidateRecord`, `CandidateItem`, inline profile-edit state) — several fields the registration wizard *collects* (gender, DOB, company, designation, education details, references) are **not actually persisted** by the frontend's own mock save flow, so they were deliberately left out of the `Candidates` table too, matching the blueprint's own (already-complete) field list rather than the frontend's noisier collected-but-discarded fields.

**Phase 4 is complete (2026-08-04):** Atomic Exam Snapshot, Evaluation, Result Publishing — `exam` schema: `CandidateExamSessions`, `CandidateExamSessionQuestions`, `CandidateExamSessionQuestionOptions`, `CandidateExamAnswers`, `CandidateExamAnswerOptions`. `StartExamSessionCommand` builds the entire snapshot graph (shuffled questions/options, frozen environment/timing/candidate/paper metadata, one pre-created `CandidateExamAnswer` row per question) in a single `SaveChangesAsync` call — true one-transaction atomicity, no explicit `BEGIN TRAN` needed since EF's change tracker resolves the whole in-memory graph at once. `SubmitExamCommand` auto-evaluates MCQ answers (all-or-nothing for MULTI_CHOICE) and leaves Coding/SQL/Subjective `Pending`. `PublishAssessmentResultCommand` runs the blueprint's full checklist, locks every answer (`EvaluationLocked = 1`), and auto-advances the candidate to the next pre-created `CandidatePipelineProgress` row if they passed (or sets `Candidate.Status = "Offered"`/`"Rejected"` if it was the last round). **Verified live, fully end-to-end**: vacancy → paper → publish → link paper to round → register candidate → assign flow (passcode issued) → start exam → answer both questions correctly → submit (auto-scored 100%) → publish → candidate auto-advanced to `Offered` → confirmed re-publish and post-lock answer edits are both rejected.

Two real bugs were found and fixed while building/testing this phase (not just deviations — actual defects):
1. **Phase 3's `AssignPipelineFlowCommand` had the wrong `CandidatePipelineProgress.RoundType`** — it was copying `VacancyPipelineFlowRound.RoundType` (Aptitude/Technical/F2F/HR/Group Discussion, the frontend's vocabulary) verbatim, but the blueprint's `CandidatePipelineProgress.RoundType` is the coarser Assessment/Interview classification used to route into the exam engine vs. interview scheduling. Fixed via `STEP.Application.Common.PipelineRoundClassification.Classify(...)` (Aptitude/Technical → Assessment; everything else → Interview).
2. **A whole gap**: Phase 2 built the `VacancyRoundAssessment` table (the link between a pipeline round and its question paper) but never built a command to populate it — without one, the exam engine had no way to know which paper belongs to which round. Added `AssignQuestionPaperToRoundCommand` (`POST /vacancies/pipeline-rounds/{roundId}/question-paper`) to close that gap.

Also found: EF Core 10 / .NET 10's LINQ expression interpreter throws a `TypeLoadException` on inline `new[] {...}.Contains(x)` inside a query predicate (reproducible, unrelated to our code's logic) — rewritten as explicit `||` conditions in `StartExamSessionCommandHandler`. Worth checking for elsewhere if similar patterns get added later.

Deferred: step 8 of `PublishAssessmentResultCommand`'s checklist (dispatch `AssessmentEvaluatedEvent` to `OutboxMessages`) is skipped — `OutboxMessages` doesn't exist until Phase 5. There's a comment marking exactly where to wire it in.

Also added: a candidate self-service exam login mechanism the blueprint assumes exists but doesn't fully specify — `Candidate.ExamPasscodeHash` (BCrypt), generated and returned in plaintext exactly once (in `AssignPipelineFlowCommand`'s and `PublishAssessmentResultCommand`'s response) whenever the candidate's current round becomes an Assessment round. There's no email/SMS delivery channel until Phase 5's Outbox exists, so for now the caller (HR/recruiter) is expected to relay it manually — same "hand out credentials directly" pattern as the Phase 1 seed users.

**Phase 5 is complete (2026-08-04):** Interview Scheduling, Outbox Transactional Queue, Director PIN Offer Approvals — `interview` schema (`Interviews`, `InterviewRoundDetails`, `OfferLetters`) and `notification` schema (`OutboxMessages`). A shared `ICandidateAdvancementService` (extracted from Phase 4's inline logic) is now used by both `PublishAssessmentResultCommand` and the new `PublishInterviewResultCommand`, so Assessment-round and Interview-round results advance the candidate identically. `GenerateOfferLetterCommand` produces a real QuestPDF-rendered offer letter PDF (verified: valid `%PDF-1.7`, downloadable), stored via the existing `IFileStorageService`. `ApproveOfferCommand` enforces mandatory Director PIN verification (role check + BCrypt PIN match) — verified both rejection paths (non-Director user, wrong PIN) and the success path. Phase 4's deferred Outbox dispatch (step 8) is now wired in, plus three more event types (`InterviewEvaluatedEvent`, `OfferGeneratedEvent`, `OfferApprovedEvent`) — all four written transactionally alongside their business change and picked up by a new `OutboxDispatcherHostedService` (polls every 15s). **Verified live, fully end-to-end**: assessment round passed → auto-advanced to interview round (no exam passcode issued, since it's Interview-classified) → interview scheduled → panelist feedback submitted → interview result published (pass) → candidate resolved to `Offered` (last round) → offer letter generated (real PDF downloaded and confirmed valid) → Director-PIN approval tested with both rejection paths and the success path → confirmed all 4 outbox events transitioned `Pending` → `Sent` within one dispatcher poll cycle (log lines captured as evidence).

**Note on the simulated dispatch:** `OutboxDispatcherHostedService` logs what would be sent and marks messages `Sent` — there is no real SMTP/SMS provider configured, so nothing is actually emailed to anyone yet. Swapping in real Quartz.NET + an email provider only requires changing the body of `DispatchOneAsync`; nothing that writes to the outbox needs to change.

**Note on cleanup ordering:** several Phase 5 FKs are deliberately `Restrict` (not `Cascade`) — e.g. `OfferLetters.CandidateId`, `CandidatePipelineProgress.VacancyPipelineFlowRoundId` — so deleting test data requires deleting `OfferLetters`/`InterviewRoundDetails`/`Interviews` before their parent `Candidates`/`Vacancies` rows. Not a bug, just the FK graph being intentionally conservative about cascading deletes on financial/interview records.

**Phase 6 is complete (2026-08-04):** QR Code Walk-in Drive, Executive Funnel Analytics — `qr` schema (`QRCodes`, `QRScanAnalytics`), plus the `Candidate.QRCodeId` FK (deferred from Phase 3, since `QRCodes` didn't exist yet) is now wired up. `GenerateQRCodeCommand` produces a real registration URL (`{baseUrl}/apply/{code}`); `PublicRegistrationController` (`GET/POST /publicregistration`) is entirely anonymous — no staff JWT — since it's what a candidate's phone hits after scanning. A shared `QRCodeAvailability.Check(...)` helper enforces Active status, registration deadline, and capacity uniformly across scan-recording and self-registration. `GetRecruitmentFunnelQuery` computes real executive KPIs (status breakdown, pass rate, average time-to-hire, offer acceptance rate) from actual `Candidates`/`CandidatePipelineProgress`/`OfferLetters` data — not hardcoded fallback numbers like the old deleted Phase-0 draft's `ReportsController` had. **Verified live, fully end-to-end**: vacancy → QR code generated (capacity=1) → public scan recorded → public self-registration succeeds → second registration correctly rejected (capacity reached) → analytics correctly show 2 scans/1 success/50% conversion → funnel report reflects the new candidate → cancelling the QR code correctly closes it to further registration.

This completes all 6 phases of the blueprint's backend roadmap. See `STEP.Persistence/Migrations/` for applied migrations and `STEP.Persistence/Seed/` for seed data (including dev-only bootstrap credentials — rotate before real production use).

## What's Next

The backend (Phases 1-6) is done and verified end-to-end, but the frontend has only ever been wired for login (Phase 1). Every other screen — Vacancy creation wizard, Question Paper publish flow, Candidate registration/profile, exam workspace, interview scheduling, offer approval, QR drive management — still runs on local mock state. That full frontend-wiring pass is the next major piece of work, by explicit user decision (finish all backend phases first, then one dedicated wiring pass).

---

# STEP Enterprise ATS — Backend Discovery & Architecture Blueprint (V1 Final Enterprise Blueprint)

> **Document Type:** Production-Ready Enterprise Solution Architecture & Technical Implementation Blueprint
> **Scope:** STEP ATS Version 1 (V1 Production Release)
> **Target Framework:** ASP.NET Core 10, Entity Framework Core 10, SQL Server 2022, Next.js 16 App Router (BFF Architecture)
> **Design Patterns:** Clean Architecture, MediatR CQRS, Outbox Pattern, FluentValidation, AutoMapper, Serilog Audit Logging
> **Architecture Grade:** 10/10 Production Standard — Complete Auditability, Paper Locking & Deterministic Evaluation
> **Source of Truth:** STEP Enterprise ATS Frontend Codebase

---

## Executive Summary & V1 Architectural Directives

This document establishes the official production-grade backend architecture blueprint for **STEP Enterprise ATS V1**. Built upon a comprehensive audit of the frontend workflows and enterprise hiring standards, this blueprint decouples **exam attempts** from **official published assessment results**, incorporates **paper locking/publishing controls**, and provides a 100% audit-proof candidate progression engine.

### FINAL PRODUCTION ARCHITECTURE HIGHLIGHTS

1. **Question Paper Publishing & Strict Locking Rules (`VacancyQuestionPapers`):**
   * **`Draft`:** Editable, upload questions, delete questions.
   * **`Published`:** READ-ONLY, immutable, no edits/deletes allowed. Requires passing publication validation (marks match, total questions match, MCQs have correct option).
   * **`Archived`:** Unavailable for new candidate assignments. Existing snapshots continue functioning.
2. **Immutable Assessment Snapshot Engine & JSON Preservation:**
   * **`StartExamSessionCommand`** generates an atomic SQL transaction creating `CandidateExamSessions` with `ShuffleSeed`, `SnapshotPaperCode`, `SnapshotPaperTitle`, `CandidateExamSessionQuestions` (`DisplayOrder`, `OriginalOrder`, `OriginalQuestionVersion`, `QuestionSnapshotJson`), and `CandidateExamSessionQuestionOptions`.
   * **Environment Metadata:** Freezes `FrozenAssessmentMode`, `TestSource` (`Home`/`Office`), `FrozenIPAddress`, `FrozenBrowser`, `FrozenOS`, and `FrozenDeviceType`.
3. **Single Source of Truth Ordered Progression (`CandidatePipelineProgress`):**
   * `Candidates.CurrentPipelineProgressId` points to the active progression stage.
   * Progression history is ordered simply via `RoundOrder` (`ORDER BY RoundOrder ASC`), eliminating linked-list overhead for high-performance SQL analytics.
4. **Evaluation Engine, Locking & Auto-Advancement:**
   * **MCQs:** Auto-evaluated by the system against the snapshot.
   * **Coding, SQL & Subjective:** Evaluated manually on the Candidate Evaluation screen.
   * **`PublishAssessmentResultCommand`:** Executes in a single SQL transaction verifying session submission and full manual evaluation; updates `CandidateExamSessions.EvaluationStatus = Published`, sets `EvaluationLocked = 1` on `CandidateExamAnswers`, updates `CandidatePipelineProgress`, automatically assigns the candidate to the next pipeline round if passed (`RoundOrder + 1`), and dispatches `AssessmentEvaluatedEvent` to `OutboxMessages`.

---

## Complete Enterprise End-to-End Workflow

```
   1. VACANCY CREATION & PIPELINE SETUP (`Vacancies` → `VacancyPipelineFlows` & `Rounds`)
              │
              ▼
   2. QUESTION PAPER UPLOAD & LOCKING (`VacancyQuestionPapers` Status: Draft ──► Published [Read-Only])
              │
              ▼
   3. CANDIDATE REGISTRATION & PIPELINE ASSIGNMENT (`Candidates.CurrentPipelineProgressId`)
              │
              ▼
   4. ATOMIC EXAM SESSION & SNAPSHOT CREATION (`StartExamSessionCommand` → ShuffleSeed, Env Snapshot)
              │
              ▼
   5. CANDIDATE EXAM EXECUTION (`CandidateExamSessions` & `CandidateExamAnswers`)
              │
              ▼
   6. MCQ AUTO-EVALUATION & MANUAL SQL/CODING/SUBJECTIVE EVALUATION (`CandidateExamAnswers`)
              │
              ▼
   7. ATOMIC RESULT PUBLISH & EVALUATION LOCK (`PublishAssessmentResultCommand` → `EvaluationLocked = 1`)
              │
              ▼
   8. AUTOMATIC ADVANCEMENT TO NEXT PIPELINE ROUND (`CandidatePipelineProgress` RoundOrder + 1)
```

---

## Detailed Enterprise Database Schema (30 Tables)

### 1. `Vacancies`
* **Fields:** `Id` (Guid, PK), `VacancyCode` (nvarchar(30), Required), `Title` (nvarchar(150), Required), `DepartmentId` (Guid, FK), `HiringLocationId` (Guid, FK), `EmploymentTypeId` (Guid, FK), `DriveType` (nvarchar(30), Required - `Walk-in` / `Direct`), `Status` (nvarchar(30), Required - `Draft` / `Active` / `Closed`), `TotalOpenings` (int, Required), `MinExperienceYears` (int), `MaxExperienceYears` (int), `JobDescription` (nvarchar(max)), `WalkinDriveDate` (datetime2, Nullable), `WalkinStartTime` (time, Nullable), `WalkinEndTime` (time, Nullable), `RowVersion` (byte[], Timestamp), `CreatedAt` (datetime2), `CreatedBy` (Guid), `IsDeleted` (bit, Default 0).

### 2. `VacancyQuestionPapers` (Strict Locking Rules)
* **Fields:** `Id` (Guid, PK), `VacancyId` (Guid, FK), `PaperCode` (nvarchar(30), Required), `Title` (nvarchar(150), Required), `PaperVersion` (int, Default 1), `TotalQuestions` (int, Required), `TotalMarks` (decimal(6,2), Required), `DurationMinutes` (int, Required), `PassingPercentage` (decimal(5,2), Required), `Status` (nvarchar(20), Required - `Draft` / `Published` / `Archived`), `PublishedAt` (datetime2, Nullable), `PublishedBy` (Guid, FK, Nullable), `CreatedAt` (datetime2), `CreatedBy` (Guid), `IsDeleted` (bit, Default 0).
* **Publication Rules:** `Draft` (editable); `Published` (read-only, assigned to candidates); `Archived` (unavailable for new candidates).

### 3. `VacancyQuestions` & `VacancyQuestionOptions`
* **`VacancyQuestions`:** `Id` (Guid, PK), `VacancyQuestionPaperId` (Guid, FK), `QuestionNumber` (int), `Version` (int, Default 1), `RoundNumber` (int), `RoundTitle` (nvarchar(100)), `SectionTitle` (nvarchar(100)), `QuestionType` (nvarchar(30)), `Category` (nvarchar(100)), `Difficulty` (nvarchar(20)), `QuestionText` (nvarchar(max)), `Marks` (decimal(5,2)), `TimeAllowedMinutes` (int), `CodeTemplate` (nvarchar(max), Nullable), `SqlSchema` (nvarchar(max), Nullable).
* **`VacancyQuestionOptions`:** `Id` (Guid, PK), `VacancyQuestionId` (Guid, FK), `OriginalOptionLabel` (nvarchar(10)), `OptionText` (nvarchar(max)), `IsCorrect` (bit).

### 4. `Candidates` (Pointer to Current Pipeline Progress)
* **Fields:** `Id` (Guid, PK), `CandidateCode` (nvarchar(30), Required), `FirstName` (nvarchar(50), Required), `LastName` (nvarchar(50), Required), `Email` (nvarchar(100), Required), `Phone` (nvarchar(20), Required), `VacancyId` (Guid, FK), `CurrentPipelineProgressId` (Guid, FK, Nullable), `CurrentStage` (nvarchar(50), Required - Cached Projection), `Status` (nvarchar(30), Required - `Applied` / `In-Progress` / `Offered` / `Rejected` / `Withdrawn`), `RegistrationChannel` (nvarchar(30), Required - `Walk-in` / `Office` / `Referral` / `Portal` / `Recruiter`), `QRCodeId` (Guid, FK, Nullable), `ReferralEmployeeName` (nvarchar(100), Nullable), `TotalExperienceYears` (decimal(4,1)), `CurrentCTC` (decimal(12,2)), `ExpectedCTC` (decimal(12,2)), `NoticePeriodDays` (int), `CurrentLocation` (nvarchar(100)), `HighestQualification` (nvarchar(100)), `RowVersion` (byte[], Timestamp), `CreatedAt` (datetime2), `CreatedBy` (Guid, Nullable), `IsDeleted` (bit, Default 0).

### 5. `CandidatePipelineProgress` (Ordered Round Progression Audit)
* **Fields:** `Id` (Guid, PK), `CandidateId` (Guid, FK), `PipelineFlowRoundId` (Guid, FK), `RoundNumber` (int, Required), `RoundTitle` (nvarchar(100), Required), `RoundType` (nvarchar(30), Required - `Assessment` / `Interview`), `Status` (nvarchar(30), Required - `Assigned` / `InProgress` / `Passed` / `Failed` / `Waived`), `ScoreObtained` (decimal(6,2), Nullable), `StartedAt` (datetime2, Nullable), `CompletedAt` (datetime2, Nullable), `EvaluatedAt` (datetime2, Nullable), `EvaluatorId` (Guid, FK, Nullable), `SkippedBy` (Guid, FK, Nullable), `SkipReason` (nvarchar(max), Nullable), `Remarks` (nvarchar(max), Nullable), `CreatedAt` (datetime2).
* **FK Relationships:** `CandidatePipelineProgress.CandidateId` → `Candidates.Id`, `PipelineFlowRoundId` → `VacancyPipelineFlowRounds.Id`.
* **Ordering Rule:** Progression timeline ordered via `RoundNumber` (`ORDER BY RoundNumber ASC`).

### 6. `CandidateExamSessions` (Complete Snapshot Freeze & Environment Metadata)
* **Fields:**
  * **Primary Keys & Metadata:** `Id` (Guid, PK), `CandidateId` (Guid, FK), `VacancyId` (Guid, FK), `VacancyQuestionPaperId` (Guid, FK), `CandidatePipelineProgressId` (Guid, FK, Nullable), `SessionToken` (nvarchar(100), Required), `AttemptNumber` (int, Default 1).
  * **Reproducibility & Seed:** `ShuffleSeed` (int, Required - e.g. `54829173`).
  * **Frozen Candidate, Vacancy & Paper Snapshot:** `SnapshotCandidateName` (nvarchar(100)), `SnapshotCandidateCode` (nvarchar(30)), `SnapshotVacancyTitle` (nvarchar(150)), `SnapshotVacancyCode` (nvarchar(30)), `SnapshotAssessmentName` (nvarchar(150)), `SnapshotPaperCode` (nvarchar(30)), `SnapshotPaperTitle` (nvarchar(150)), `OriginalPaperVersion` (int, Required, Default 1).
  * **Frozen Environment Metadata:** `FrozenAssessmentMode` (nvarchar(20), Required - `Home` / `Office` / `Hybrid`), `TestSource` (nvarchar(20), Required - `Home` / `Office`), `FrozenIPAddress` (nvarchar(50)), `FrozenBrowser` (nvarchar(50)), `FrozenOS` (nvarchar(50)), `FrozenDeviceType` (nvarchar(30)).
  * **Frozen Timing & Rules Snapshot:** `FrozenRoundDurationMinutes` (int), `FrozenTotalDurationMinutes` (int), `FrozenPassingPercentage` (decimal(5,2)), `FrozenShuffleEnabled` (bit), `FrozenOptionShuffleEnabled` (bit).
  * **Rich Session & Simplified Evaluation Statuses:**
    * `SessionStatus` (nvarchar(30), Required - `Created` / `Ready` / `InProgress` / `Paused` / `AutoSubmitted` / `Submitted` / `Evaluated` / `Cancelled` / `Expired`).
    * `EvaluationStatus` (nvarchar(30), Required - `Pending` / `PartiallyEvaluated` / `FullyEvaluated` / `Published`).
  * **Frozen Result Snapshot:** `TotalScore` (decimal(6,2), Default 0), `TotalMarks` (decimal(6,2), Required), `Percentage` (decimal(5,2), Default 0), `ResultStatus` (nvarchar(20), Default `Pending` - `Pass` / `Fail`), `AssessmentIntegrityScore` (decimal(5,2), Default 100.00), `TabSwitchWarnings` (int, Default 0).
  * **Timestamps:** `ActiveRoundNumber` (int, Default 1), `ActiveQuestionIndex` (int, Default 0), `RoundTimeLeftSeconds` (int), `TotalTimeLeftSeconds` (int), `StartedAt` (datetime2), `SubmittedAt` (datetime2, Nullable), `EvaluatedAt` (datetime2, Nullable), `EvaluatorId` (Guid, FK, Nullable).

### 7. `CandidateExamSessionQuestions` & `Options` (JSON Snapshot & Single Marks Field)
* **`CandidateExamSessionQuestions`:** `Id` (Guid, PK), `CandidateExamSessionId` (Guid, FK), `OriginalVacancyQuestionId` (Guid, FK), `OriginalQuestionVersion` (int, Default 1), `DisplayOrder` (int), `OriginalOrder` (int), `RoundNumber` (int), `RoundTitle` (nvarchar(100)), `SectionNumber` (int), `SectionTitle` (nvarchar(100)), `RoundOrder` (int), `QuestionType` (nvarchar(30)), `Category` (nvarchar(100)), `QuestionText` (nvarchar(max)), `Marks` (decimal(5,2)), `TimeAllowedMinutes` (int), `CodeTemplate` (nvarchar(max), Nullable), `SqlSchema` (nvarchar(max), Nullable), `QuestionSnapshotJson` (nvarchar(max), Required - Complete serialized question payload).
* **`CandidateExamSessionQuestionOptions`:** `Id` (Guid, PK), `CandidateExamSessionQuestionId` (Guid, FK), `OriginalVacancyQuestionOptionId` (Guid, FK), `DisplayOrder` (int), `OriginalOrder` (int), `DisplayOptionLabel` (nvarchar(10)), `OptionText` (nvarchar(max)), `IsCorrect` (bit).

### 8. `CandidateExamAnswers` (Single Marks Field & EvaluationLocked Flag)
* **Fields:**
  * `Id` (Guid, PK), `CandidateExamSessionId` (Guid, FK), `CandidateExamSessionQuestionId` (Guid, FK)
  * `Marks` (decimal(5,2), Required - Max marks copied from Snapshot Question)
  * `SubmittedAnswerText` (nvarchar(max), Nullable - Submitted SQL Query / Code / Essay)
  * `MarksObtained` (decimal(5,2), Default 0)
  * `EvaluationStatus` (nvarchar(30), Default `Pending` - `Pending` / `InReview` / `Evaluated` / `Published`)
  * `EvaluationLocked` (bit, Default 0 - Set to 1 upon result publication)
  * `EvaluatorRemarks` (nvarchar(max), Nullable)
  * `EvaluatedBy` (Guid, FK, Nullable)
  * `EvaluatedAt` (datetime2, Nullable)
  * `AnsweredAt` (datetime2)

---

## Detailed 6-Phase Implementation Roadmap

---

### PHASE 1: Core Governance, Identity, RBAC Permissions & Master Taxonomies

#### Objective
Establish ASP.NET Core 10 Clean Architecture solution foundation, EF Core 10 DbContext, SQL Server audit configurations with `CorrelationId`, JWT authentication, Refresh Token rotation, Director PIN verification engine, granular RBAC permissions layer (`RolePermissions`), and Master Data taxonomies.

---

### PHASE 2: Vacancy Engine, Flow Split, Paper Locking & Decoupled Round Assessments

#### Objective
Build the Vacancy lifecycle engine including the 4-step wizard, direct vacancy-owned assessment pattern builder (`VacancyAssessmentSections`), **normalized pipeline flow header/rounds split** (`VacancyPipelineFlows` & `VacancyPipelineFlowRounds`), **question paper publishing & locking workflow** (`VacancyQuestionPapers` Status `Draft` → `Published`), decoupled round assessment engine (`VacancyRoundAssessments`), test location mappings, and Excel question paper parsing.

#### CQRS Commands & Queries
* `CreateVacancyCommand(...)` → `IRequestHandler<CreateVacancyCommand, Guid>`
* `PublishQuestionPaperCommand(PaperId)` → `IRequestHandler<PublishQuestionPaperCommand, bool>`
  * **Strict Publication Validation Checklist:**
    1. Validate `TotalQuestions` matches assessment section pattern.
    2. Validate total paper marks match section marks.
    3. Validate every MCQ question has at least one `IsCorrect = 1` option.
    4. Validate coding/SQL/subjective questions have valid non-empty question text.
    5. Set `Status = Published`, `PublishedAt = DateTime.UtcNow`, `PublishedBy = UserId`. Locks paper for candidate assignments.
* `ImportVacancyQuestionsCommand(VacancyId, Stream FileStream)` → `IRequestHandler<ImportVacancyQuestionsCommand, QuestionImportResultDto>`

---

### PHASE 3: Candidate Journey, Pipeline Progression & Document Repository

#### Objective
Build candidate profile registration (Direct & Walk-in), pipeline flow assignment (`CurrentPipelineProgressId`), ordered stage progression tracking (`CandidatePipelineProgress`), exact 3-document storage management with provider metadata (`StorageProvider`), and Candidate Directory filtering.

---

### PHASE 4: Atomic Exam Snapshot, Evaluation & Result Publishing Transaction

#### Objective
Implement proctored exam workspace APIs (`/exam`), remote Home login vs venue Office magic link verification, **atomic candidate assessment snapshot creation (`StartExamSessionCommand`)**, reproducible `ShuffleSeed` recording, environment metadata snapshot (`IP`, `Browser`, `OS`, `DeviceType`), `ResumeExamSessionQuery` instant reload hydration, round countdown timers, multi-choice answer option bindings (`CandidateExamAnswerOptions`), snapshot-driven evaluation screen (`CandidateAssessmentEvaluationView`), and **atomic result publishing transaction with auto-advancement (`PublishAssessmentResultCommand`)**.

#### CQRS Commands & Queries
* `StartExamSessionCommand(CandidateCode, Passcode, SessionToken)` → `IRequestHandler<StartExamSessionCommand, LiveExamWorkspaceDto>` (Single SQL Transaction)
* `ResumeExamSessionQuery(SessionToken)` → `IRequestHandler<ResumeExamSessionQuery, LiveExamWorkspaceDto>`
* `EvaluateCandidateAnswerCommand(CandidateExamAnswerId, MarksObtained, EvaluatorRemarks)` → `IRequestHandler<EvaluateCandidateAnswerCommand, bool>`
* `PublishAssessmentResultCommand(CandidateExamSessionId, Remarks)` → `IRequestHandler<PublishAssessmentResultCommand, bool>`
  * **Atomic Handler Transaction Checklist:**
    1. Verify session status is `Submitted`.
    2. Verify all subjective/code questions have `EvaluationStatus == Evaluated`.
    3. Calculate final total score, percentage, and result status (`Pass`/`Fail`).
    4. Set `CandidateExamSessions.EvaluationStatus = Published` and `EvaluatedAt = DateTime.UtcNow`.
    5. Set `EvaluationLocked = 1` across all `CandidateExamAnswers` (making answers read-only).
    6. Update active `CandidatePipelineProgress` stage to `Passed`/`Failed` and set `CompletedAt`.
    7. **If Passed:** Automatically insert and assign candidate to the next round in `CandidatePipelineProgress` (`RoundNumber + 1`).
    8. Dispatch `AssessmentEvaluatedEvent` to `OutboxMessages`.

---

### PHASE 5: Interview Scheduling, Outbox Transactional Queue, Director PIN Approvals & Offers

#### Objective
Build technical interview round details (`InterviewRoundDetails`), panelist scorecards, mandatory Director PIN verification for high-privilege decisions, automated QuestPDF Offer Letter generation, `OutboxMessages` transactional queue, and Quartz.NET email dispatch.

---

### PHASE 6: QR Code Walk-in Drive & Executive Funnel Analytics

#### Objective
Implement Walk-in drive venue QR code generation, URL tracking, scan analytics, candidate self-registration ingestion, and executive dashboard funnel KPI reporting.

---

## Complete Production Database Table Inventory (30 Tables)

| Domain | Table Name | Purpose & Enterprise Architectural Highlights |
| :--- | :--- | :--- |
| **Auth, Users & RBAC** | `Users`, `UserRefreshTokens`, `Permissions`, `RolePermissions`, `AuditLogs` | Identity, refresh tokens, granular RBAC permissions, `CorrelationId` audit logs. |
| **Master Data** | `MasterRoles`, `MasterDepartments`, `MasterHiringLocations`, `MasterTestLocations`, `MasterEmploymentTypes` | System taxonomies. |
| **Vacancies & Papers** | `Vacancies`, `VacancyTestLocations`, `VacancyPipelineFlows`, `VacancyPipelineFlowRounds`, `VacancyAssessmentSections`, `VacancyRoundAssessments`, `VacancyQuestionPapers`, `VacancyQuestions`, `VacancyQuestionOptions` | Flow Header/Rounds split, assessment sections, decoupled assessments, **Paper Publishing & Locking (`Draft` → `Published` [Read-Only])**. |
| **Candidates & Journey**| `Candidates`, `CandidateDocuments`, `CandidatePipelineProgress` | Candidate profiles, **`CurrentPipelineProgressId` pointer**, **`CandidatePipelineProgress` ordered progression log (`RoundNumber`)**. |
| **Immutable Exam Snapshot**| `CandidateExamSessions`, `CandidateExamSessionQuestions`, `CandidateExamSessionQuestionOptions`, `CandidateExamAnswers`, `CandidateExamAnswerOptions` | **Atomic snapshot transaction, ShuffleSeed, Environment Metadata (IP, Browser, OS, DeviceType), `QuestionSnapshotJson`, `EvaluationLocked = 1` read-only lock.** |
| **Interviews, Offers & Outbox**| `Interviews`, `InterviewRoundDetails`, `OfferLetters`, `OutboxMessages` | Scheduled interviews, `InterviewRoundDetails`, Director PIN offers, `OutboxMessages` transactional email queue. |
| **QR Code Walk-in** | `QRCodes`, `QRScanAnalytics` | Venue QR code generation, registration channels, public self-registration, analytics. |

---

> **Authorization Confirmation:** The 10/10 Production-Grade Architecture Blueprint for STEP Enterprise ATS V1 is finalized and authorized for immediate Phase 1 implementation in ASP.NET Core 10, Entity Framework Core 10, and SQL Server 2022.
