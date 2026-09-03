# EF Core Refactoring & Database Performance Plan

This document outlines the systematic refactoring of Entity Framework (EF) Core queries in the STEP backend.
Currently, the codebase suffers from severe EF Core anti-patterns that degrade performance, cause excessive memory usage, and introduce dangerous concurrency bugs.

We will fix this codebase section by section to avoid massive merge conflicts and ensure thorough testing.

---

## 🚨 Identified Anti-Patterns

1. **Concurrency Race Conditions (`CountAsync + 1`)**
   - Generating IDs by querying the total count of a table is a catastrophic race condition. If two threads hit this code at the same time, they generate duplicate IDs.
2. **Cartesian Explosion (`.Include().ThenInclude()` without `AsSplitQuery`)**
   - Loading deep nested collections (e.g., Exam Sessions → Answers → Selected Options) generates massive SQL joins, duplicating root table data thousands of times over the network.
3. **Chatty Network Calls (Sequential `await db...`)**
   - Hitting the database sequentially in loops or via cascading `if` fallbacks adds hundreds of milliseconds of latency per request.
4. **Memory Bloat (Missing `.AsNoTracking()`)**
   - Read-only endpoints tracking massive entity graphs waste server RAM and CPU.

---

## 🛠️ Refactoring Roadmap

### Phase 1: Candidate Registration & Concurrency Fixes [COMPLETED ✅]

_Focus: Resolving dangerous `CountAsync()` race conditions, implementing clean sequential IDs (`1, 2, 3...`), and eliminating Cartesian explosions._

- **Files Updated:**
  - `RegisterCandidateCommandHandler.cs`
  - `RegisterCandidateViaQRCommandHandler.cs`
  - `RegisterUniversalCandidateCommandHandler.cs`
  - `GenerateTempExamPassCommandHandler.cs`
- **Actions Implemented:**
  - **Sequential Candidate ID (Option A):** Initial insert writes a unique temporary token (`TMP-{guid}`) to satisfy non-null and unique constraints safely under high concurrency. Upon initial `SaveChangesAsync()`, SQL Server assigns its native atomic `INT IDENTITY(1,1)` (`candidate.Id`). The handler then formats and saves the clean sequential code: `$"CND-{DateTime.UtcNow:yyyy}-{candidate.Id:D4}"` (e.g., `CND-2026-0001`, `CND-2026-0002`, `CND-2026-0003`).
  - **Cartesian Explosion Prevented:** Added `.AsSplitQuery()` to all multi-level `.Include(v => v.PipelineFlows).ThenInclude(f => f.Rounds)` queries.
  - **Build Verified:** Application restored with `Microsoft.EntityFrameworkCore.Relational` 9.0.2; compiled with 0 errors.

### Phase 2: Exam & Assessment Execution [COMPLETED]

_Focus: Cartesian Explosion and loop queries in high-throughput exam endpoints._

- **Files fixed:**
  - `StartExamSessionCommandHandler.cs` (Removed 5 sequential blueprint checks and `MasterQuestions` loop).
  - `SaveExamAnswerBatchCommandHandler.cs` (Added `.AsSplitQuery()`).
  - `SubmitExamCommandHandler.cs` & `PublishAssessmentResultV2CommandHandler.cs` (Added `.AsSplitQuery()`).
  - `ResumeExamSessionQueryHandler.cs` (Added `.AsSplitQuery()`).
- **Actions:**
  - Rewrote loops querying the DB into a single batched memory query.
  - Implemented `.AsSplitQuery()` for all heavy exam payloads preventing Cartesian explosions.

### Phase 3: Staff, Vacancy & Reporting Queries [COMPLETED]

_Focus: Read-only memory bloat and dashboard latency._

- **Files fixed:**
  - `GetVacanciesQueryHandler.cs` (Already used `.AsNoTracking()` and highly optimized `.Select()` projections).
  - `GetCandidateByIdQueryHandler.cs` (Added `.AsSplitQuery()` to fix deep Cartesian candidate history).
  - `GetExamEvaluationViewQueryHandler.cs` (Added `.AsSplitQuery()` to V1 and V2 sessions).
  - `GetQuestionPapersQueryHandler.cs` (Added `.AsSplitQuery()` to `VacancyQuestionPapers`).
- **Actions:**
  - Apply strict `.AsNoTracking()` policies.
  - Use `.Select()` projections instead of loading full entities where only summary data is needed.

---

## 📝 Execution Protocol

- Each Phase will be executed as a separate step.
- After fixing the files in a phase, we will run `dotnet build` to ensure the compilation is clean.
- Only upon passing all checks will we move to the next phase.
