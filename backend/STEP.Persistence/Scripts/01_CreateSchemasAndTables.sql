-- ====================================================================================
-- STEP Enterprise ATS — Database Script 01: Schemas & Tables (V2 Isolated Schemas)
-- Target Database: InterviewTestPortal
-- Schemas Created: examv2, staffv2
-- ====================================================================================

-- 1. Ensure Isolated Schemas Exist
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'examv2')
BEGIN
    EXEC('CREATE SCHEMA examv2 AUTHORIZATION dbo;');
END
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'staffv2')
BEGIN
    EXEC('CREATE SCHEMA staffv2 AUTHORIZATION dbo;');
END
GO

-- 2. examv2.AssessmentBlueprints (Universal Assessment Templates)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('examv2') AND name = 'AssessmentBlueprints')
BEGIN
    CREATE TABLE examv2.AssessmentBlueprints (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Code NVARCHAR(30) NOT NULL CONSTRAINT UQ_AssessmentBlueprints_Code UNIQUE,
        Name NVARCHAR(80) NOT NULL,
        DefaultPassingPercentage DECIMAL(5,2) NOT NULL DEFAULT 70.00,
        TotalDurationMinutes INT NOT NULL DEFAULT 0,
        TotalQuestions INT NOT NULL DEFAULT 0,
        TotalMarks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        EnableQuestionShuffling BIT NOT NULL DEFAULT 1,
        EnableOptionShuffling BIT NOT NULL DEFAULT 1,
        IsDefault BIT NOT NULL DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedBy NVARCHAR(60) NULL,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        UpdatedBy NVARCHAR(60) NULL,
        UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

-- 3. examv2.AssessmentBlueprintSectionRules (Relational Multi-Section Blueprint Rules)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('examv2') AND name = 'AssessmentBlueprintSectionRules')
BEGIN
    CREATE TABLE examv2.AssessmentBlueprintSectionRules (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        BlueprintId INT NOT NULL FOREIGN KEY REFERENCES examv2.AssessmentBlueprints(Id) ON DELETE CASCADE,
        SectionName NVARCHAR(60) NOT NULL,
        SectionType NVARCHAR(30) NOT NULL, -- 'TechnicalMCQ', 'Coding', 'SQLQuery', 'SubjectiveTheory'
        QuestionType NVARCHAR(30) NOT NULL, -- 'SINGLE_CHOICE', 'MULTI_CHOICE', 'CODING', 'SQL', 'SUBJECTIVE'
        ExperienceTier NVARCHAR(30) NOT NULL DEFAULT '{InheritFromCandidateTier}',
        RequiredTags NVARCHAR(100) NOT NULL DEFAULT '{InheritFromRole}',
        QuestionCount INT NOT NULL DEFAULT 5,
        MarksPerQuestion DECIMAL(5,2) NOT NULL DEFAULT 1.00,
        TimeLimitMinutes INT NULL,
        SelectionStrategy NVARCHAR(30) NOT NULL DEFAULT 'RandomShuffled',
        DisplayOrder INT NOT NULL DEFAULT 1,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    CREATE INDEX IX_BlueprintSectionRules_BlueprintId ON examv2.AssessmentBlueprintSectionRules(BlueprintId);
END
GO

-- 4. examv2.MasterQuestions (Central Question Bank Pool)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('examv2') AND name = 'MasterQuestions')
BEGIN
    CREATE TABLE examv2.MasterQuestions (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Code NVARCHAR(30) NOT NULL CONSTRAINT UQ_MasterQuestions_Code UNIQUE,
        Language NVARCHAR(50) NOT NULL,
        SectionType NVARCHAR(30) NOT NULL,
        QuestionType NVARCHAR(30) NOT NULL,
        ExperienceTier NVARCHAR(30) NOT NULL, -- 'Fresher', 'Junior', 'Mid-Level', 'Senior', 'Lead'
        QuestionText NVARCHAR(MAX) NOT NULL,
        Marks DECIMAL(5,2) NOT NULL DEFAULT 1.00,
        SqlSchema NVARCHAR(MAX) NULL,
        StarterCode NVARCHAR(MAX) NULL,
        TestCases NVARCHAR(MAX) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedBy NVARCHAR(60) NULL,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        UpdatedBy NVARCHAR(60) NULL,
        UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE NONCLUSTERED INDEX IX_MasterQuestions_Sampler
    ON examv2.MasterQuestions(Language, SectionType, QuestionType, ExperienceTier, IsActive)
    INCLUDE (Id, Code, QuestionText, Marks);
END
GO

-- 5. examv2.MasterQuestionOptions (MCQ Choices)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('examv2') AND name = 'MasterQuestionOptions')
BEGIN
    CREATE TABLE examv2.MasterQuestionOptions (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        MasterQuestionId INT NOT NULL FOREIGN KEY REFERENCES examv2.MasterQuestions(Id) ON DELETE CASCADE,
        OptionLabel NVARCHAR(5) NOT NULL, -- 'A', 'B', 'C', 'D'
        OptionText NVARCHAR(MAX) NOT NULL,
        IsCorrect BIT NOT NULL DEFAULT 0,
        DisplayOrder INT NOT NULL DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    CREATE INDEX IX_MasterQuestionOptions_QuestionId ON examv2.MasterQuestionOptions(MasterQuestionId);
END
GO

-- 6. examv2.CandidateExamSessions (Live Candidate Assessment Sessions)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('examv2') AND name = 'CandidateExamSessions')
BEGIN
    CREATE TABLE examv2.CandidateExamSessions (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        SessionToken NVARCHAR(80) NOT NULL CONSTRAINT UQ_CandidateExamSessions_Token UNIQUE,
        CandidateId INT NOT NULL FOREIGN KEY REFERENCES candidate.Candidates(CandidateId) ON DELETE CASCADE,
        VacancyId INT NOT NULL FOREIGN KEY REFERENCES vacancy.Vacancies(VacancyId) ON DELETE NO ACTION,
        AssessmentBlueprintId INT NOT NULL FOREIGN KEY REFERENCES examv2.AssessmentBlueprints(Id) ON DELETE NO ACTION,
        CandidatePipelineProgressId INT NULL FOREIGN KEY REFERENCES candidate.CandidatePipelineProgress(CandidatePipelineProgressId) ON DELETE NO ACTION,
        CandidateTier NVARCHAR(30) NOT NULL,
        RolePrimaryLanguage NVARCHAR(50) NOT NULL,
        SessionStatus NVARCHAR(30) NOT NULL DEFAULT 'Created',
        EvaluationStatus NVARCHAR(30) NOT NULL DEFAULT 'Pending',
        StartedAt DATETIMEOFFSET NULL,
        SubmittedAt DATETIMEOFFSET NULL,
        EvaluatedAt DATETIMEOFFSET NULL,
        TotalDurationMinutes INT NOT NULL DEFAULT 0,
        TotalTimeLeftSeconds INT NOT NULL DEFAULT 0,
        LockedSectionIdsCsv NVARCHAR(300) NULL,
        TabSwitchWarningCount INT NOT NULL DEFAULT 0,
        AssessmentIntegrityScore DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        TotalMarks DECIMAL(6,2) NOT NULL DEFAULT 0.00,
        TotalScore DECIMAL(6,2) NOT NULL DEFAULT 0.00,
        Percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        PassingPercentage DECIMAL(5,2) NOT NULL DEFAULT 70.00,
        ResultStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
        EvaluatorUserId INT NULL FOREIGN KEY REFERENCES staff.Users(UserId) ON DELETE NO ACTION,
        EvaluatorRemarks NVARCHAR(MAX) NULL,
        RowVersion ROWVERSION NOT NULL,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

-- 7. examv2.CandidateExamSessionQuestions (Frozen Session Question Snapshots)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('examv2') AND name = 'CandidateExamSessionQuestions')
BEGIN
    CREATE TABLE examv2.CandidateExamSessionQuestions (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CandidateExamSessionId INT NOT NULL FOREIGN KEY REFERENCES examv2.CandidateExamSessions(Id) ON DELETE CASCADE,
        SectionRuleId INT NOT NULL FOREIGN KEY REFERENCES examv2.AssessmentBlueprintSectionRules(Id) ON DELETE NO ACTION,
        OriginalMasterQuestionId INT NOT NULL FOREIGN KEY REFERENCES examv2.MasterQuestions(Id) ON DELETE NO ACTION,
        SectionName NVARCHAR(60) NOT NULL,
        SectionType NVARCHAR(30) NOT NULL,
        QuestionType NVARCHAR(30) NOT NULL,
        DisplayOrder INT NOT NULL,
        QuestionText NVARCHAR(MAX) NOT NULL,
        Marks DECIMAL(5,2) NOT NULL DEFAULT 1.00,
        TimeAllowedMinutes INT NULL,
        ProgrammingLanguage NVARCHAR(50) NULL,
        SqlSchema NVARCHAR(MAX) NULL,
        QuestionSnapshotJson NVARCHAR(MAX) NOT NULL,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    CREATE UNIQUE INDEX UX_ExamSessionQuestions_Order ON examv2.CandidateExamSessionQuestions(CandidateExamSessionId, DisplayOrder);
END
GO

-- 8. examv2.CandidateExamSessionQuestionOptions (Randomized Display Options)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('examv2') AND name = 'CandidateExamSessionQuestionOptions')
BEGIN
    CREATE TABLE examv2.CandidateExamSessionQuestionOptions (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CandidateExamSessionQuestionId INT NOT NULL FOREIGN KEY REFERENCES examv2.CandidateExamSessionQuestions(Id) ON DELETE CASCADE,
        OriginalMasterQuestionOptionId INT NOT NULL FOREIGN KEY REFERENCES examv2.MasterQuestionOptions(Id) ON DELETE NO ACTION,
        DisplayOptionLabel NVARCHAR(5) NOT NULL,
        DisplayOrder INT NOT NULL,
        OptionText NVARCHAR(MAX) NOT NULL,
        IsCorrect BIT NOT NULL,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

-- 9. examv2.CandidateExamAnswers (Candidate Answer Responses)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('examv2') AND name = 'CandidateExamAnswers')
BEGIN
    CREATE TABLE examv2.CandidateExamAnswers (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CandidateExamSessionId INT NOT NULL FOREIGN KEY REFERENCES examv2.CandidateExamSessions(Id) ON DELETE CASCADE,
        CandidateExamSessionQuestionId INT NOT NULL FOREIGN KEY REFERENCES examv2.CandidateExamSessionQuestions(Id) ON DELETE NO ACTION,
        SubmittedAnswerText NVARCHAR(MAX) NULL,
        MarksObtained DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        EvaluationStatus NVARCHAR(30) NOT NULL DEFAULT 'Pending',
        EvaluationLocked BIT NOT NULL DEFAULT 0,
        EvaluatorRemarks NVARCHAR(MAX) NULL,
        AnsweredAt DATETIMEOFFSET NULL,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    CREATE UNIQUE INDEX UX_CandidateExamAnswers_SessionQuestion ON examv2.CandidateExamAnswers(CandidateExamSessionId, CandidateExamSessionQuestionId);
END
GO

-- 10. examv2.CandidateExamAnswerOptions (Selected Options for MCQ)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('examv2') AND name = 'CandidateExamAnswerOptions')
BEGIN
    CREATE TABLE examv2.CandidateExamAnswerOptions (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CandidateExamAnswerId INT NOT NULL FOREIGN KEY REFERENCES examv2.CandidateExamAnswers(Id) ON DELETE CASCADE,
        CandidateExamSessionQuestionOptionId INT NOT NULL FOREIGN KEY REFERENCES examv2.CandidateExamSessionQuestionOptions(Id) ON DELETE NO ACTION
    );
END
GO

-- 11. examv2.ExamProctoringLogs (Anti-Cheat Security Audit Logs)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('examv2') AND name = 'ExamProctoringLogs')
BEGIN
    CREATE TABLE examv2.ExamProctoringLogs (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CandidateExamSessionId INT NOT NULL FOREIGN KEY REFERENCES examv2.CandidateExamSessions(Id) ON DELETE CASCADE,
        EventType NVARCHAR(30) NOT NULL, -- 'TabSwitch', 'FullscreenExit', 'MultiTabDetected', 'Terminated'
        ClientIp NVARCHAR(45) NULL,
        UserAgent NVARCHAR(300) NULL,
        Metadata NVARCHAR(MAX) NULL,
        LoggedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
    CREATE INDEX IX_ExamProctoringLogs_SessionId ON examv2.ExamProctoringLogs(CandidateExamSessionId);
END
GO

-- 12. staffv2.DirectorAccessLinks (24-Hour Tokenized Gateway)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('staffv2') AND name = 'DirectorAccessLinks')
BEGIN
    CREATE TABLE staffv2.DirectorAccessLinks (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Token NVARCHAR(80) NOT NULL CONSTRAINT UQ_DirectorAccessLinks_Token UNIQUE,
        CandidateId INT NOT NULL FOREIGN KEY REFERENCES candidate.Candidates(CandidateId) ON DELETE CASCADE,
        CreatedAt DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        ExpiresAt DATETIMEOFFSET NOT NULL,
        IsRevoked BIT NOT NULL DEFAULT 0,
        RevokedAt DATETIMEOFFSET NULL
    );
    CREATE INDEX IX_DirectorAccessLinks_CandidateId ON staffv2.DirectorAccessLinks(CandidateId);
END
GO

-- 13. Safe Non-Breaking ALTER on vacancy.Vacancies
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('vacancy.Vacancies') AND name = 'AssessmentBlueprintId')
BEGIN
    ALTER TABLE vacancy.Vacancies
    ADD AssessmentBlueprintId INT NULL FOREIGN KEY REFERENCES examv2.AssessmentBlueprints(Id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('vacancy.Vacancies') AND name = 'PassingPercentageOverride')
BEGIN
    ALTER TABLE vacancy.Vacancies
    ADD PassingPercentageOverride DECIMAL(5,2) NULL;
END
GO
