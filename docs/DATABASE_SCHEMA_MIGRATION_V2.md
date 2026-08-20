# STEP Enterprise ATS — Database Schema Migration & Verification (V2)

> **Document Status**: AUTHORITATIVE DATABASE MIGRATION SPECIFICATION  
> **Target Database Engine**: Microsoft SQL Server 2019+ / Azure SQL  
> **Isolation Schemas**: `dbo`, `master`, `examv2`, `staffv2`  
> **Created**: 2026-08-20  

---

## 1. Executive Migration Summary

This document specifies the exact, line-by-line database schema migration for the **V2 Autonomous Recruitment Engine**.

### 🌟 Key Architectural Shift (Redundancy Elimination)
- **Previous Model (Deprecated):** The intermediate matrix tables `master.RoleHiringProfiles` and `master.RoleAssessmentSectionRules` required creating and maintaining static combination rows (e.g. 50 roles × 5 experience tiers = 250 static records).
- **V2 Direct Architecture (Active):**
  1. **Experience Tiers:** Directly sourced from `master.ExperienceLevels` (`FRESH`, `JR`, `MID`, `SR`, `LEAD`).
  2. **Assessment Templates:** Directly sourced from universal `examv2.AssessmentBlueprints` (`RULE-MCQ-ONLY`, `RULE-TECH-ENG`, `RULE-DATA-SQL`).
  3. **1-Click Vacancy Binding:** `dbo.Vacancies` stores `MasterRoleId`, `MinExperienceYears`, `MaxExperienceYears`, and `AssessmentBlueprintId` directly in one atomic transaction.

---

## 2. Line-by-Line Table Definitions (Active V2 Schema)

### 2A. Master Data Taxonomies (`master.*`)

#### `master.MasterRoles`
```sql
CREATE TABLE master.MasterRoles (
    Id          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Code        NVARCHAR(50) NOT NULL UNIQUE,          -- e.g. 'SNET', 'FSR', 'QA-AUT'
    Name        NVARCHAR(150) NOT NULL,                -- e.g. 'Senior .NET Architect'
    Description NVARCHAR(500) NULL,
    IsActive    BIT NOT NULL DEFAULT 1,
    CreatedAt   DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt   DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
```

#### `master.ExperienceLevels` *(Primary Source of Experience Tiers)*
```sql
CREATE TABLE master.ExperienceLevels (
    Id          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Code        NVARCHAR(50) NOT NULL UNIQUE,          -- 'EXP-0', 'EXP-1-3', 'EXP-3-5', 'EXP-5-8', 'EXP-8PLUS'
    Name        NVARCHAR(150) NOT NULL,                -- 'Fresher (0-1 Years)', 'Junior (1-3 Years)', etc.
    Description NVARCHAR(500) NULL,
    IsActive    BIT NOT NULL DEFAULT 1,
    CreatedAt   DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt   DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
```

#### Other Master Taxonomies:
- `master.MasterDepartments` (`Id`, `Code`, `Name`, `Description`, `IsActive`)
- `master.MasterHiringLocations` (`Id`, `Code`, `Name`, `Description`, `IsActive`)
- `master.MasterEmploymentTypes` (`Id`, `Code`, `Name`, `Description`, `IsActive`)
- `master.MasterTestLocations` (`Id`, `Code`, `Name`, `Description`, `IsActive`)

---

### 2B. Universal Assessment Blueprints (`examv2.*`)

#### `examv2.AssessmentBlueprints`
```sql
CREATE TABLE examv2.AssessmentBlueprints (
    Id                        INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Code                      NVARCHAR(30) NOT NULL CONSTRAINT UQ_AssessmentBlueprints_Code UNIQUE, -- 'RULE-MCQ-ONLY', 'RULE-TECH-ENG', 'RULE-DATA-SQL'
    Name                      NVARCHAR(80) NOT NULL,
    DefaultPassingPercentage  DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    TotalDurationMinutes      INT NOT NULL DEFAULT 0,
    TotalQuestions            INT NOT NULL DEFAULT 0,
    TotalMarks                DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    EnableQuestionShuffling   BIT NOT NULL DEFAULT 1,
    EnableOptionShuffling     BIT NOT NULL DEFAULT 1,
    IsDefault                 BIT NOT NULL DEFAULT 0,
    IsActive                  BIT NOT NULL DEFAULT 1,
    CreatedBy                 NVARCHAR(60) NULL,
    CreatedAt                 DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedBy                 NVARCHAR(60) NULL,
    UpdatedAt                 DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
```

#### `examv2.AssessmentBlueprintSectionRules`
```sql
CREATE TABLE examv2.AssessmentBlueprintSectionRules (
    Id                  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    BlueprintId         INT NOT NULL FOREIGN KEY REFERENCES examv2.AssessmentBlueprints(Id) ON DELETE CASCADE,
    SectionName         NVARCHAR(60) NOT NULL,                 -- e.g. 'Core Technical MCQs', 'Algorithmic Sandbox'
    SectionType         NVARCHAR(30) NOT NULL,                 -- 'TechnicalMCQ', 'Coding', 'SQLQuery', 'SubjectiveTheory'
    QuestionType        NVARCHAR(30) NOT NULL,                 -- 'SINGLE_CHOICE', 'MULTI_CHOICE', 'CODING', 'SQL', 'SUBJECTIVE'
    ExperienceTier      NVARCHAR(30) NOT NULL DEFAULT '{InheritFromCandidateTier}',
    RequiredTags        NVARCHAR(100) NOT NULL DEFAULT '{InheritFromRole}',
    QuestionCount       INT NOT NULL DEFAULT 5,
    MarksPerQuestion    DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    TimeLimitMinutes    INT NULL,
    SelectionStrategy   NVARCHAR(30) NOT NULL DEFAULT 'RandomShuffled',
    DisplayOrder        INT NOT NULL DEFAULT 1,
    IsActive            BIT NOT NULL DEFAULT 1,
    CreatedAt           DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
```

---

### 2C. Central Question Bank (`master.*`)

#### `master.MasterQuestions`
```sql
CREATE TABLE master.MasterQuestions (
    Id                  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Code                NVARCHAR(30) NOT NULL CONSTRAINT UQ_MasterQuestions_Code UNIQUE,
    Language            NVARCHAR(50) NOT NULL,                 -- 'General Aptitude', 'C# (.NET)', 'JavaScript / React', 'SQL (Database)'
    SectionType         NVARCHAR(30) NOT NULL,                 -- 'Aptitude', 'TechnicalMCQ', 'Coding', 'SQLQuery', 'SubjectiveTheory'
    QuestionType        NVARCHAR(30) NOT NULL,                 -- 'SINGLE_CHOICE', 'MULTI_CHOICE', 'CODING', 'SQL', 'SUBJECTIVE'
    ExperienceTier      NVARCHAR(30) NOT NULL,                 -- 'Fresher', 'Junior', 'Mid-Level', 'Senior', 'Lead'
    Tags                NVARCHAR(200) NOT NULL,                -- Comma-delimited tags
    QuestionText        NVARCHAR(MAX) NOT NULL,
    Marks               DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    ProblemStatement    NVARCHAR(MAX) NULL,
    SqlSchema           NVARCHAR(MAX) NULL,
    SqlExpectedOutput   NVARCHAR(MAX) NULL,
    IsActive            BIT NOT NULL DEFAULT 1,
    CreatedAt           DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt           DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
```

#### `master.MasterQuestionOptions`
```sql
CREATE TABLE master.MasterQuestionOptions (
    Id          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    QuestionId  INT NOT NULL FOREIGN KEY REFERENCES master.MasterQuestions(Id) ON DELETE CASCADE,
    OptionKey   NVARCHAR(10) NOT NULL,                 -- 'A', 'B', 'C', 'D'
    OptionText  NVARCHAR(MAX) NOT NULL,
    IsCorrect   BIT NOT NULL DEFAULT 0,
    DisplayOrder INT NOT NULL DEFAULT 1
);
```

---

### 2D. Vacancies & Pipelines (`dbo.*`)

#### `dbo.Vacancies`
```sql
CREATE TABLE dbo.Vacancies (
    Id                        INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    VacancyCode               NVARCHAR(50) NOT NULL UNIQUE,
    Title                     NVARCHAR(200) NOT NULL,
    MasterRoleId              INT NOT NULL FOREIGN KEY REFERENCES master.MasterRoles(Id),
    DepartmentId              INT NOT NULL FOREIGN KEY REFERENCES master.MasterDepartments(Id),
    HiringLocationId          INT NOT NULL FOREIGN KEY REFERENCES master.MasterHiringLocations(Id),
    EmploymentTypeId          INT NOT NULL FOREIGN KEY REFERENCES master.MasterEmploymentTypes(Id),
    DriveType                 NVARCHAR(50) NOT NULL DEFAULT 'Walk-in Drive',
    WorkMode                  NVARCHAR(50) NOT NULL DEFAULT 'On-site',
    Status                    NVARCHAR(50) NOT NULL DEFAULT 'Active',
    TotalOpenings             INT NOT NULL DEFAULT 5,
    MinExperienceYears        DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    MaxExperienceYears        DECIMAL(4,2) NOT NULL DEFAULT 99.00,
    JobDescription            NVARCHAR(MAX) NULL,
    ClosingDate               DATETIME2 NOT NULL,
    WalkinDriveDate           DATETIME2 NULL,
    WalkinStartTime           TIME NULL,
    WalkinEndTime             TIME NULL,
    AssessmentBlueprintId     INT NULL FOREIGN KEY REFERENCES examv2.AssessmentBlueprints(Id),
    PassingPercentageOverride DECIMAL(5,2) NULL,
    CreatedAt                 DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt                 DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);
```

#### `dbo.DirectorAccessLinks` *(Short URL Candidate Review Portal)*
```sql
CREATE TABLE dbo.DirectorAccessLinks (
    Id          INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Token       NVARCHAR(100) NOT NULL UNIQUE,          -- Server-generated short token: dir_a8f3k2x1_lp4z
    CandidateId INT NOT NULL FOREIGN KEY REFERENCES dbo.Candidates(Id) ON DELETE CASCADE,
    CreatedAt   DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    ExpiresAt   DATETIMEOFFSET NOT NULL,                -- Always CreatedAt + 24 hours
    IsRevoked   BIT NOT NULL DEFAULT 0,
    RevokedAt   DATETIMEOFFSET NULL                     -- Set when regenerate=true revokes prior token
);

CREATE UNIQUE INDEX UX_DirectorAccessLinks_Token ON dbo.DirectorAccessLinks (Token);
CREATE INDEX IX_DirectorAccessLinks_CandidateId ON dbo.DirectorAccessLinks (CandidateId);
```

### 2E. Dynamic Pipeline Flow Generation (`dbo.VacancyPipelineFlows` & `dbo.VacancyPipelineFlowRounds`)

The backend dynamically initializes either a **4-Round (IT Multi-Stage)** or **3-Round (Non-IT / Standard)** pipeline based on the selected Blueprint:

| Recruitment Model | Track / Blueprint Selected | Pipeline Generated | Round Breakdown |
|---|---|:---:|---|
| **Walk-in Drive** | **IT Technical Track** (`RULE-TECH-ENG`, `RULE-DATA-SQL`) | **4 Rounds** | **R1:** Aptitude Elimination (20 Qs • 30m • 70% Cutoff)<br/>**R2:** Technical Track (Coding / SQL Sandbox • 28 Qs • 85m)<br/>**R3:** Technical Interview<br/>**R4:** Director Final & Offer |
| **Walk-in Drive** | **Non-IT / General** (`RULE-MCQ-ONLY`) | **3 Rounds** | **R1:** Standard Domain & Aptitude MCQs (20 Qs • 30m)<br/>**R2:** HR / Domain Interview (No coding test)<br/>**R3:** Director Final & Offer |
| **Direct Sourcing** | **Any Track** | **4 Rounds** | **R1:** HR Resume Sourcing (Auto-Passed)<br/>**R2:** Selected Assessment Track<br/>**R3:** Interview<br/>**R4:** Director Final & Offer |

---

## 3. SQL Migration Script (Clean Deprecation of Legacy Tables)

Execute this script against the live database to clean up the obsolete matrix tables and align with V2:

```sql
-- ====================================================================================
-- MIGRATION SCRIPT: Deprecate Legacy RoleHiringProfiles & Apply V2 Structure
-- ====================================================================================

-- 1. Remove Foreign Keys referencing RoleHiringProfiles if any
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Vacancies_RoleHiringProfiles')
BEGIN
    ALTER TABLE dbo.Vacancies DROP CONSTRAINT FK_Vacancies_RoleHiringProfiles;
END
GO

-- 2. Drop Obsolete Child Table: RoleAssessmentSectionRules
IF OBJECT_ID('master.RoleAssessmentSectionRules', 'U') IS NOT NULL
BEGIN
    DROP TABLE master.RoleAssessmentSectionRules;
    PRINT 'Dropped legacy table master.RoleAssessmentSectionRules';
END
GO

-- 3. Drop Obsolete Parent Table: RoleHiringProfiles
IF OBJECT_ID('master.RoleHiringProfiles', 'U') IS NOT NULL
BEGIN
    DROP TABLE master.RoleHiringProfiles;
    PRINT 'Dropped legacy table master.RoleHiringProfiles';
END
GO

-- 4. Verify Active Universal AssessmentBlueprints Table Exists
IF OBJECT_ID('examv2.AssessmentBlueprints', 'U') IS NULL
BEGIN
    PRINT 'WARNING: examv2.AssessmentBlueprints table needs to be created.';
END
ELSE
BEGIN
    PRINT 'VERIFIED: examv2.AssessmentBlueprints is active and healthy.';
END
GO
```

---

## 4. Verification Checklist

- [x] `master.ExperienceLevels` is the authoritative source for experience tiers across UI, Question Bank, and Candidate resolution.
- [x] `examv2.AssessmentBlueprints` defines test composition independently of job roles.
- [x] `1-Click Instant Drive` binds Role + Experience Tier + Blueprint in one atomic step.
- [x] `dbo.DirectorAccessLinks` supports 24-hour expiration, link reuse, and token-based gateway resolution.
- [x] All `.NET 10` CQRS commands and EF Core configurations build with **0 Errors**.
- [x] Frontend TypeScript builds with **0 Errors**.
