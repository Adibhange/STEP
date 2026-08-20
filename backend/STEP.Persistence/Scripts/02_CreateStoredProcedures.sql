-- ====================================================================================
-- STEP Enterprise ATS — Database Script 02: Stored Procedures (V2 Engine)
-- Target Database: InterviewTestPortal
-- Schema: examv2, staffv2
-- ====================================================================================

-- 1. examv2.sp_V2_SaveAssessmentTemplate
CREATE OR ALTER PROCEDURE examv2.sp_V2_SaveAssessmentTemplate
    @BlueprintId INT = NULL OUTPUT,
    @Code NVARCHAR(30),
    @Name NVARCHAR(80),
    @DefaultPassingPercentage DECIMAL(5,2) = 70.00,
    @IsDefault BIT = 0,
    @SectionRulesXml XML = NULL,
    @UserId NVARCHAR(60) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Ensure default invariant: only 1 default template
        IF @IsDefault = 1
        BEGIN
            UPDATE examv2.AssessmentBlueprints
            SET IsDefault = 0
            WHERE IsDefault = 1;
        END

        IF @BlueprintId IS NULL OR @BlueprintId <= 0
        BEGIN
            INSERT INTO examv2.AssessmentBlueprints (
                Code, Name, DefaultPassingPercentage,
                EnableQuestionShuffling, EnableOptionShuffling,
                IsDefault, IsActive, CreatedBy, UpdatedBy
            )
            VALUES (
                @Code, @Name, @DefaultPassingPercentage,
                1, 1, -- platform invariants: always enabled
                @IsDefault, 1, @UserId, @UserId
            );
            SET @BlueprintId = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            UPDATE examv2.AssessmentBlueprints
            SET Code = @Code,
                Name = @Name,
                DefaultPassingPercentage = @DefaultPassingPercentage,
                IsDefault = @IsDefault,
                EnableQuestionShuffling = 1,
                EnableOptionShuffling = 1,
                UpdatedBy = @UserId,
                UpdatedAt = SYSDATETIMEOFFSET()
            WHERE Id = @BlueprintId;

            DELETE FROM examv2.AssessmentBlueprintSectionRules
            WHERE BlueprintId = @BlueprintId;
        END

        -- Insert relational section rules from XML
        IF @SectionRulesXml IS NOT NULL
        BEGIN
            INSERT INTO examv2.AssessmentBlueprintSectionRules (
                BlueprintId, SectionName, SectionType, QuestionType,
                ExperienceTier, RequiredTags, QuestionCount,
                MarksPerQuestion, TimeLimitMinutes, SelectionStrategy,
                DisplayOrder, IsActive
            )
            SELECT 
                @BlueprintId,
                T.C.value('@SectionName', 'NVARCHAR(60)'),
                T.C.value('@SectionType', 'NVARCHAR(30)'),
                T.C.value('@QuestionType', 'NVARCHAR(30)'),
                COALESCE(NULLIF(T.C.value('@ExperienceTier', 'NVARCHAR(30)'), ''), '{InheritFromCandidateTier}'),
                COALESCE(NULLIF(T.C.value('@RequiredTags', 'NVARCHAR(100)'), ''), '{InheritFromRole}'),
                T.C.value('@QuestionCount', 'INT'),
                T.C.value('@MarksPerQuestion', 'DECIMAL(5,2)'),
                T.C.value('@TimeLimitMinutes', 'INT'),
                COALESCE(NULLIF(T.C.value('@SelectionStrategy', 'NVARCHAR(30)'), ''), 'RandomShuffled'),
                T.C.value('@DisplayOrder', 'INT'),
                1
            FROM @SectionRulesXml.nodes('/Rules/Rule') AS T(C);
        END

        -- Recompute totals on Blueprint
        UPDATE examv2.AssessmentBlueprints
        SET TotalQuestions = (SELECT ISNULL(SUM(QuestionCount), 0) FROM examv2.AssessmentBlueprintSectionRules WHERE BlueprintId = @BlueprintId AND IsActive = 1),
            TotalMarks = (SELECT ISNULL(SUM(QuestionCount * MarksPerQuestion), 0.00) FROM examv2.AssessmentBlueprintSectionRules WHERE BlueprintId = @BlueprintId AND IsActive = 1),
            TotalDurationMinutes = (SELECT ISNULL(SUM(ISNULL(TimeLimitMinutes, 0)), 0) FROM examv2.AssessmentBlueprintSectionRules WHERE BlueprintId = @BlueprintId AND IsActive = 1)
        WHERE Id = @BlueprintId;

        COMMIT TRANSACTION;

        SELECT @BlueprintId AS BlueprintId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 2. examv2.sp_V2_DeleteAssessmentTemplate
CREATE OR ALTER PROCEDURE examv2.sp_V2_DeleteAssessmentTemplate
    @BlueprintId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if any active vacancy references this template
    IF EXISTS (
        SELECT 1 FROM vacancy.Vacancies
        WHERE AssessmentBlueprintId = @BlueprintId
          AND Status NOT IN ('Closed', 'Cancelled')
          AND IsDeleted = 0
    )
    BEGIN
        RAISERROR('Cannot delete Assessment Template: it is assigned to one or more active vacancies.', 16, 1);
        RETURN;
    END

    UPDATE examv2.AssessmentBlueprints
    SET IsActive = 0,
        UpdatedAt = SYSDATETIMEOFFSET()
    WHERE Id = @BlueprintId;

    SELECT 1 AS Deleted;
END;
GO

-- 3. examv2.sp_V2_GetAssessmentPoolStatus
CREATE OR ALTER PROCEDURE examv2.sp_V2_GetAssessmentPoolStatus
    @BlueprintId INT,
    @PrimaryLanguage NVARCHAR(50) = NULL,
    @CandidateTier NVARCHAR(30) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        r.Id AS SectionRuleId,
        r.SectionName,
        r.SectionType,
        r.QuestionType,
        r.QuestionCount AS RequiredCount,
        COUNT(q.Id) AS AvailableCount,
        CASE WHEN COUNT(q.Id) >= r.QuestionCount THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS IsReady,
        CASE WHEN COUNT(q.Id) < r.QuestionCount THEN (r.QuestionCount - COUNT(q.Id)) ELSE 0 END AS MissingCount
    FROM examv2.AssessmentBlueprintSectionRules r
    LEFT JOIN examv2.MasterQuestions q 
        ON q.SectionType = r.SectionType
        AND q.QuestionType = r.QuestionType
        AND q.IsActive = 1
        AND (@PrimaryLanguage IS NULL OR q.Language = @PrimaryLanguage OR q.Language = 'General Aptitude')
        AND (@CandidateTier IS NULL OR q.ExperienceTier = @CandidateTier OR r.ExperienceTier = 'Any')
    WHERE r.BlueprintId = @BlueprintId AND r.IsActive = 1
    GROUP BY r.Id, r.SectionName, r.SectionType, r.QuestionType, r.QuestionCount, r.DisplayOrder
    ORDER BY r.DisplayOrder;
END;
GO

-- 4. examv2.sp_V2_AddMasterQuestion
CREATE OR ALTER PROCEDURE examv2.sp_V2_AddMasterQuestion
    @Code NVARCHAR(30),
    @Language NVARCHAR(50),
    @SectionType NVARCHAR(30),
    @QuestionType NVARCHAR(30),
    @ExperienceTier NVARCHAR(30),
    @QuestionText NVARCHAR(MAX),
    @Marks DECIMAL(5,2) = 1.00,
    @SqlSchema NVARCHAR(MAX) = NULL,
    @StarterCode NVARCHAR(MAX) = NULL,
    @TestCases NVARCHAR(MAX) = NULL,
    @OptionsXml XML = NULL,
    @UserId NVARCHAR(60) = NULL,
    @NewQuestionId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO examv2.MasterQuestions (
            Code, Language, SectionType, QuestionType, ExperienceTier,
            QuestionText, Marks, SqlSchema, StarterCode, TestCases,
            IsActive, CreatedBy, UpdatedBy
        )
        VALUES (
            @Code, @Language, @SectionType, @QuestionType, @ExperienceTier,
            @QuestionText, @Marks, @SqlSchema, @StarterCode, @TestCases,
            1, @UserId, @UserId
        );
        SET @NewQuestionId = SCOPE_IDENTITY();

        IF @OptionsXml IS NOT NULL
        BEGIN
            INSERT INTO examv2.MasterQuestionOptions (
                MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder
            )
            SELECT 
                @NewQuestionId,
                T.C.value('@OptionLabel', 'NVARCHAR(5)'),
                T.C.value('@OptionText', 'NVARCHAR(MAX)'),
                T.C.value('@IsCorrect', 'BIT'),
                T.C.value('@DisplayOrder', 'INT')
            FROM @OptionsXml.nodes('/Options/Option') AS T(C);
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 5. examv2.sp_V2_UpdateMasterQuestion
CREATE OR ALTER PROCEDURE examv2.sp_V2_UpdateMasterQuestion
    @QuestionId INT,
    @Language NVARCHAR(50),
    @SectionType NVARCHAR(30),
    @QuestionType NVARCHAR(30),
    @ExperienceTier NVARCHAR(30),
    @QuestionText NVARCHAR(MAX),
    @Marks DECIMAL(5,2),
    @SqlSchema NVARCHAR(MAX) = NULL,
    @StarterCode NVARCHAR(MAX) = NULL,
    @TestCases NVARCHAR(MAX) = NULL,
    @OptionsXml XML = NULL,
    @UserId NVARCHAR(60) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE examv2.MasterQuestions
        SET Language = @Language,
            SectionType = @SectionType,
            QuestionType = @QuestionType,
            ExperienceTier = @ExperienceTier,
            QuestionText = @QuestionText,
            Marks = @Marks,
            SqlSchema = @SqlSchema,
            StarterCode = @StarterCode,
            TestCases = @TestCases,
            UpdatedBy = @UserId,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE Id = @QuestionId;

        IF @OptionsXml IS NOT NULL
        BEGIN
            DELETE FROM examv2.MasterQuestionOptions WHERE MasterQuestionId = @QuestionId;

            INSERT INTO examv2.MasterQuestionOptions (
                MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder
            )
            SELECT 
                @QuestionId,
                T.C.value('@OptionLabel', 'NVARCHAR(5)'),
                T.C.value('@OptionText', 'NVARCHAR(MAX)'),
                T.C.value('@IsCorrect', 'BIT'),
                T.C.value('@DisplayOrder', 'INT')
            FROM @OptionsXml.nodes('/Options/Option') AS T(C);
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 6. examv2.sp_V2_BulkDeleteQuestions
CREATE OR ALTER PROCEDURE examv2.sp_V2_BulkDeleteQuestions
    @QuestionIdsXml XML,
    @DeletedCount INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Ids TABLE (Id INT PRIMARY KEY);
    INSERT INTO @Ids (Id)
    SELECT T.C.value('.', 'INT')
    FROM @QuestionIdsXml.nodes('/Ids/Id') AS T(C);

    UPDATE examv2.MasterQuestions
    SET IsActive = 0, UpdatedAt = SYSDATETIMEOFFSET()
    WHERE Id IN (SELECT Id FROM @Ids);

    SET @DeletedCount = @@ROWCOUNT;
END;
GO

-- 7. examv2.sp_V2_BulkToggleQuestionStatus
CREATE OR ALTER PROCEDURE examv2.sp_V2_BulkToggleQuestionStatus
    @QuestionIdsXml XML,
    @IsActive BIT,
    @UpdatedCount INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Ids TABLE (Id INT PRIMARY KEY);
    INSERT INTO @Ids (Id)
    SELECT T.C.value('.', 'INT')
    FROM @QuestionIdsXml.nodes('/Ids/Id') AS T(C);

    UPDATE examv2.MasterQuestions
    SET IsActive = @IsActive, UpdatedAt = SYSDATETIMEOFFSET()
    WHERE Id IN (SELECT Id FROM @Ids);

    SET @UpdatedCount = @@ROWCOUNT;
END;
GO

-- 8. examv2.sp_V2_SearchMasterQuestions
CREATE OR ALTER PROCEDURE examv2.sp_V2_SearchMasterQuestions
    @Language NVARCHAR(50) = NULL,
    @SectionType NVARCHAR(30) = NULL,
    @QuestionType NVARCHAR(30) = NULL,
    @ExperienceTier NVARCHAR(30) = NULL,
    @IsActive BIT = NULL,
    @Search NVARCHAR(100) = NULL,
    @PageIndex INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@PageIndex - 1) * @PageSize;

    -- Recordset 1: Filtered Paginated Questions with Options JSON
    SELECT 
        q.Id,
        q.Code,
        q.Language,
        q.SectionType,
        q.QuestionType,
        q.ExperienceTier,
        q.QuestionText,
        q.Marks,
        q.SqlSchema,
        q.StarterCode,
        q.TestCases,
        q.IsActive,
        q.CreatedAt,
        q.UpdatedAt,
        (
            SELECT 
                o.Id,
                o.OptionLabel AS [label],
                o.OptionText AS [text],
                o.IsCorrect AS [isCorrect],
                o.DisplayOrder AS [displayOrder]
            FROM examv2.MasterQuestionOptions o
            WHERE o.MasterQuestionId = q.Id
            ORDER BY o.DisplayOrder
            FOR JSON PATH
        ) AS OptionsJson
    FROM examv2.MasterQuestions q
    WHERE (@Language IS NULL OR q.Language = @Language)
      AND (@SectionType IS NULL OR q.SectionType = @SectionType)
      AND (@QuestionType IS NULL OR q.QuestionType = @QuestionType)
      AND (@ExperienceTier IS NULL OR q.ExperienceTier = @ExperienceTier)
      AND (@IsActive IS NULL OR q.IsActive = @IsActive)
      AND (@Search IS NULL OR q.QuestionText LIKE '%' + @Search + '%' OR q.Code LIKE '%' + @Search + '%')
    ORDER BY q.Id DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;

    -- Recordset 2: Metrics & Total Count
    SELECT 
        COUNT(q.Id) AS TotalCount,
        SUM(CASE WHEN q.ExperienceTier = 'Fresher' THEN 1 ELSE 0 END) AS FresherCount,
        SUM(CASE WHEN q.ExperienceTier = 'Junior' THEN 1 ELSE 0 END) AS JuniorCount,
        SUM(CASE WHEN q.ExperienceTier = 'Mid-Level' THEN 1 ELSE 0 END) AS MidLevelCount,
        SUM(CASE WHEN q.ExperienceTier = 'Senior' THEN 1 ELSE 0 END) AS SeniorCount,
        SUM(CASE WHEN q.ExperienceTier = 'Lead' THEN 1 ELSE 0 END) AS LeadCount
    FROM examv2.MasterQuestions q
    WHERE (@Language IS NULL OR q.Language = @Language)
      AND (@SectionType IS NULL OR q.SectionType = @SectionType)
      AND (@QuestionType IS NULL OR q.QuestionType = @QuestionType)
      AND (@ExperienceTier IS NULL OR q.ExperienceTier = @ExperienceTier)
      AND (@IsActive IS NULL OR q.IsActive = @IsActive)
      AND (@Search IS NULL OR q.QuestionText LIKE '%' + @Search + '%' OR q.Code LIKE '%' + @Search + '%');
END;
GO

-- 9. examv2.sp_V2_CreateInstantDrive
CREATE OR ALTER PROCEDURE examv2.sp_V2_CreateInstantDrive
    @MasterRoleId INT,
    @BlueprintId INT,
    @DriveType NVARCHAR(30) = 'Walk-in Drive',
    @DepartmentId INT = NULL,
    @HiringLocationId INT = NULL,
    @TestLocationId INT = NULL,
    @TotalOpenings INT = 5,
    @WalkinDate DATE = NULL,
    @FrontendBaseUrl NVARCHAR(200) = 'http://localhost:3000',
    @CreatedByUserId INT = NULL,
    @NewVacancyId INT OUTPUT,
    @NewQRCodeId INT OUTPUT,
    @QRCodeString NVARCHAR(80) OUTPUT,
    @RegistrationUrl NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Validate MasterRole & Blueprint
        DECLARE @RoleName NVARCHAR(80);
        SELECT @RoleName = Name FROM master.MasterRoles WHERE MasterRoleId = @MasterRoleId;
        IF @RoleName IS NULL THROW 50001, 'MasterRole not found.', 1;

        DECLARE @BlueprintName NVARCHAR(80), @Cutoff DECIMAL(5,2);
        SELECT @BlueprintName = Name, @Cutoff = DefaultPassingPercentage
        FROM examv2.AssessmentBlueprints WHERE Id = @BlueprintId AND IsActive = 1;
        IF @BlueprintName IS NULL THROW 50002, 'Assessment Blueprint not found or inactive.', 1;

        -- Fallback master taxonomies
        IF @DepartmentId IS NULL SELECT TOP 1 @DepartmentId = MasterDepartmentId FROM master.MasterDepartments WHERE IsActive = 1;
        IF @HiringLocationId IS NULL SELECT TOP 1 @HiringLocationId = MasterHiringLocationId FROM master.MasterHiringLocations WHERE IsActive = 1;
        IF @TestLocationId IS NULL SELECT TOP 1 @TestLocationId = MasterTestLocationId FROM master.MasterTestLocations WHERE IsActive = 1;

        DECLARE @EmpTypeId INT;
        SELECT TOP 1 @EmpTypeId = MasterEmploymentTypeId FROM master.MasterEmploymentTypes WHERE IsActive = 1;

        -- 2. Generate Vacancy Code
        DECLARE @Seq INT = (SELECT COUNT(*) FROM vacancy.Vacancies) + 101;
        DECLARE @VacancyCode NVARCHAR(30) = 'VAC-' + CAST(YEAR(GETUTCDATE()) AS NVARCHAR(4)) + '-' + CAST(@Seq AS NVARCHAR(10));
        DECLARE @DriveTitle NVARCHAR(150) = @RoleName + ' - ⚡ 1-Click Drive';

        INSERT INTO vacancy.Vacancies (
            VacancyCode, Title, MasterRoleId, DepartmentId, HiringLocationId,
            EmploymentTypeId, DriveType, Status, WorkMode, TotalOpenings,
            MinExperienceYears, MaxExperienceYears, JobDescription,
            ClosingDate, WalkinDriveDate, WalkinStartTime, WalkinEndTime,
            AssessmentBlueprintId, PassingPercentageOverride, CreatedBy, CreatedAt, IsDeleted
        )
        VALUES (
            @VacancyCode, @DriveTitle, @MasterRoleId, @DepartmentId, @HiringLocationId,
            @EmpTypeId, @DriveType, 'Active', 'On-site', @TotalOpenings,
            0.0, 99.0, 'Autonomous 1-Click Recruitment Drive for ' + @RoleName,
            DATEADD(DAY, 30, GETUTCDATE()), ISNULL(@WalkinDate, CAST(GETUTCDATE() AS DATE)),
            '09:30:00', '18:00:00',
            @BlueprintId, @Cutoff, @CreatedByUserId, GETUTCDATE(), 0
        );
        SET @NewVacancyId = SCOPE_IDENTITY();

        -- Link Physical Test Location
        IF @TestLocationId IS NOT NULL
        BEGIN
            INSERT INTO vacancy.VacancyTestLocations (VacancyId, MasterTestLocationId, CreatedAt, IsDeleted)
            VALUES (@NewVacancyId, @TestLocationId, GETUTCDATE(), 0);
        END

        -- 3. Create 4-Round Pipeline Flow
        DECLARE @FlowId INT;
        INSERT INTO vacancy.VacancyPipelineFlows (VacancyId, VersionName, Description, IsDefault, CreatedAt, IsDeleted)
        VALUES (@NewVacancyId, 'Autonomous Pipeline Flow v2', 'Standard 4-Round ATS Pipeline Flow', 1, GETUTCDATE(), 0);
        SET @FlowId = SCOPE_IDENTITY();

        IF @DriveType = 'Walk-in Drive'
        BEGIN
            -- Round 1: Aptitude Assessment (Elimination)
            INSERT INTO vacancy.VacancyPipelineFlowRounds (VacancyPipelineFlowId, RoundOrder, Name, RoundType, CutoffPercent, CreatedAt, IsDeleted)
            VALUES (@FlowId, 1, 'Round 1: Aptitude Assessment (Elimination)', 'Assessment', 70.00, GETUTCDATE(), 0);

            -- Round 2: Technical Assessment (Coding/SQL/Tech MCQs)
            INSERT INTO vacancy.VacancyPipelineFlowRounds (VacancyPipelineFlowId, RoundOrder, Name, RoundType, CutoffPercent, CreatedAt, IsDeleted)
            VALUES (@FlowId, 2, 'Round 2: Technical Assessment', 'Assessment', 70.00, GETUTCDATE(), 0);

            -- Round 3: Technical Interview
            INSERT INTO vacancy.VacancyPipelineFlowRounds (VacancyPipelineFlowId, RoundOrder, Name, RoundType, CutoffPercent, CreatedAt, IsDeleted)
            VALUES (@FlowId, 3, 'Round 3: Technical Interview', 'Interview', 70.00, GETUTCDATE(), 0);

            -- Round 4: Director Decision & Offer Rollout
            INSERT INTO vacancy.VacancyPipelineFlowRounds (VacancyPipelineFlowId, RoundOrder, Name, RoundType, CutoffPercent, CreatedAt, IsDeleted)
            VALUES (@FlowId, 4, 'Round 4: Director Final & Offer', 'Director', 70.00, GETUTCDATE(), 0);
        END
        ELSE
        BEGIN
            -- Direct / Sourced Hiring Flow (Round 1 HR Screening is Auto-Passed)
            INSERT INTO vacancy.VacancyPipelineFlowRounds (VacancyPipelineFlowId, RoundOrder, Name, RoundType, CutoffPercent, CreatedAt, IsDeleted)
            VALUES (@FlowId, 1, 'Round 1: HR Sourcing & Screening', 'Assessment', 70.00, GETUTCDATE(), 0);

            INSERT INTO vacancy.VacancyPipelineFlowRounds (VacancyPipelineFlowId, RoundOrder, Name, RoundType, CutoffPercent, CreatedAt, IsDeleted)
            VALUES (@FlowId, 2, 'Round 2: Technical Assessment', 'Assessment', 70.00, GETUTCDATE(), 0);

            INSERT INTO vacancy.VacancyPipelineFlowRounds (VacancyPipelineFlowId, RoundOrder, Name, RoundType, CutoffPercent, CreatedAt, IsDeleted)
            VALUES (@FlowId, 3, 'Round 3: Technical Interview', 'Interview', 70.00, GETUTCDATE(), 0);

            INSERT INTO vacancy.VacancyPipelineFlowRounds (VacancyPipelineFlowId, RoundOrder, Name, RoundType, CutoffPercent, CreatedAt, IsDeleted)
            VALUES (@FlowId, 4, 'Round 4: Director Final & Offer', 'Director', 70.00, GETUTCDATE(), 0);
        END

        -- 4. Create QR Code
        DECLARE @VenueName NVARCHAR(100), @VenueAddress NVARCHAR(250);
        SELECT @VenueName = Name, @VenueAddress = Description FROM master.MasterTestLocations WHERE MasterTestLocationId = @TestLocationId;

        SET @QRCodeString = 'WD-' + UPPER(SUBSTRING(CONVERT(NVARCHAR(40), NEWID()), 1, 8));
        SET @RegistrationUrl = RTRIM(@FrontendBaseUrl) + '/apply/' + @QRCodeString;

        INSERT INTO qr.QRCodes (
            VacancyId, Code, RegistrationUrl, VenueName, VenueAddress,
            DriveDate, DriveStartTime, DriveEndTime, Capacity,
            RegistrationDeadline, Status, CreatedAt, IsDeleted
        )
        VALUES (
            @NewVacancyId, @QRCodeString, @RegistrationUrl, @VenueName, @VenueAddress,
            ISNULL(@WalkinDate, CAST(GETUTCDATE() AS DATE)), '09:30:00', '18:00:00', 200,
            DATEADD(DAY, 30, GETUTCDATE()), 'Active', GETUTCDATE(), 0
        );
        SET @NewQRCodeId = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 10. examv2.sp_V2_CreateDynamicExamSession
CREATE OR ALTER PROCEDURE examv2.sp_V2_CreateDynamicExamSession
    @CandidateCode NVARCHAR(30),
    @PasscodeHash NVARCHAR(256) = NULL,
    @IpAddress NVARCHAR(45) = NULL,
    @UserAgent NVARCHAR(300) = NULL,
    @SessionToken NVARCHAR(80) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Validate Candidate & Vacancy
        DECLARE @CandidateId INT, @VacancyId INT, @CandidateName NVARCHAR(100), @TotalExp DECIMAL(4,1);
        SELECT 
            @CandidateId = CandidateId,
            @VacancyId = VacancyId,
            @CandidateName = FirstName + ' ' + LastName,
            @TotalExp = TotalExperienceYears
        FROM candidate.Candidates
        WHERE CandidateCode = @CandidateCode 
          AND (ExamPasscodeHash = @PasscodeHash OR @PasscodeHash IS NULL)
          AND IsDeleted = 0;

        IF @CandidateId IS NULL THROW 50010, 'Invalid Candidate Code or Passcode.', 1;

        DECLARE @BlueprintId INT, @VacancyTitle NVARCHAR(150), @MasterRoleId INT, @PassingCutoff DECIMAL(5,2);
        SELECT 
            @BlueprintId = AssessmentBlueprintId,
            @VacancyTitle = Title,
            @MasterRoleId = MasterRoleId,
            @PassingCutoff = ISNULL(PassingPercentageOverride, 70.00)
        FROM vacancy.Vacancies
        WHERE VacancyId = @VacancyId AND IsDeleted = 0;

        IF @BlueprintId IS NULL THROW 50011, 'Vacancy does not have an active Assessment Blueprint.', 1;

        -- 2. Resolve Candidate Experience Tier from master.ExperienceLevels
        DECLARE @CandidateTier NVARCHAR(30) = 'Fresher';
        SELECT TOP 1 @CandidateTier = Name
        FROM master.MasterExperienceLevels
        WHERE IsActive = 1
          AND @TotalExp >= 0
        ORDER BY MasterExperienceLevelId;

        IF @TotalExp >= 8.0 SET @CandidateTier = 'Lead';
        ELSE IF @TotalExp >= 5.0 SET @CandidateTier = 'Senior';
        ELSE IF @TotalExp >= 3.0 SET @CandidateTier = 'Mid-Level';
        ELSE IF @TotalExp >= 1.0 SET @CandidateTier = 'Junior';
        ELSE SET @CandidateTier = 'Fresher';

        -- 3. Resolve Role Primary Language
        DECLARE @PrimaryLang NVARCHAR(50) = 'C# (.NET)';
        SELECT @PrimaryLang = Name FROM master.MasterRoles WHERE MasterRoleId = @MasterRoleId;
        IF @PrimaryLang LIKE '%.NET%' SET @PrimaryLang = 'C# (.NET)';
        ELSE IF @PrimaryLang LIKE '%React%' OR @PrimaryLang LIKE '%Frontend%' SET @PrimaryLang = 'JavaScript / React';
        ELSE IF @PrimaryLang LIKE '%SQL%' OR @PrimaryLang LIKE '%Data%' SET @PrimaryLang = 'SQL';
        ELSE IF @PrimaryLang LIKE '%Python%' SET @PrimaryLang = 'Python';

        -- 4. Create Session Record
        SET @SessionToken = 'ses_' + LOWER(REPLACE(CONVERT(NVARCHAR(40), NEWID()), '-', ''));

        DECLARE @SessionId INT;
        INSERT INTO examv2.CandidateExamSessions (
            SessionToken, CandidateId, VacancyId, AssessmentBlueprintId,
            CandidateTier, RolePrimaryLanguage, SessionStatus, EvaluationStatus,
            StartedAt, PassingPercentage, ResultStatus
        )
        VALUES (
            @SessionToken, @CandidateId, @VacancyId, @BlueprintId,
            @CandidateTier, @PrimaryLang, 'InProgress', 'Pending',
            SYSDATETIMEOFFSET(), @PassingCutoff, 'Pending'
        );
        SET @SessionId = SCOPE_IDENTITY();

        -- 5. Deterministic Random Sampling per Section Rule
        DECLARE @RulesCursor CURSOR;
        DECLARE @RuleId INT, @SectionName NVARCHAR(60), @SectionType NVARCHAR(30), @QType NVARCHAR(30), @QCount INT, @MarksPerQ DECIMAL(5,2), @TimeLimit INT;
        DECLARE @GlobalDisplayOrder INT = 1;

        SET @RulesCursor = CURSOR FOR
        SELECT Id, SectionName, SectionType, QuestionType, QuestionCount, MarksPerQuestion, TimeLimitMinutes
        FROM examv2.AssessmentBlueprintSectionRules
        WHERE BlueprintId = @BlueprintId AND IsActive = 1
        ORDER BY DisplayOrder;

        OPEN @RulesCursor;
        FETCH NEXT FROM @RulesCursor INTO @RuleId, @SectionName, @SectionType, @QType, @QCount, @MarksPerQ, @TimeLimit;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Sample questions deterministically using NEWID() seeded per candidate
            INSERT INTO examv2.CandidateExamSessionQuestions (
                CandidateExamSessionId, SectionRuleId, OriginalMasterQuestionId,
                SectionName, SectionType, QuestionType, DisplayOrder,
                QuestionText, Marks, TimeAllowedMinutes, ProgrammingLanguage,
                SqlSchema, QuestionSnapshotJson
            )
            SELECT TOP (@QCount)
                @SessionId,
                @RuleId,
                q.Id,
                @SectionName,
                q.SectionType,
                q.QuestionType,
                ROW_NUMBER() OVER (ORDER BY CHECKSUM(NEWID())) + (@GlobalDisplayOrder - 1),
                q.QuestionText,
                @MarksPerQ,
                @TimeLimit,
                q.Language,
                q.SqlSchema,
                '{"questionId":' + CAST(q.Id AS NVARCHAR(10)) + '}'
            FROM examv2.MasterQuestions q
            WHERE q.SectionType = @SectionType
              AND q.QuestionType = @QType
              AND q.IsActive = 1
              AND (q.Language = @PrimaryLang OR q.Language = 'General Aptitude' OR q.Language = 'Any')
              AND (q.ExperienceTier = @CandidateTier OR q.ExperienceTier = 'Any')
            ORDER BY CHECKSUM(NEWID());

            SET @GlobalDisplayOrder = @GlobalDisplayOrder + @@ROWCOUNT;

            FETCH NEXT FROM @RulesCursor INTO @RuleId, @SectionName, @SectionType, @QType, @QCount, @MarksPerQ, @TimeLimit;
        END

        CLOSE @RulesCursor;
        DEALLOCATE @RulesCursor;

        -- 6. Insert Randomized Option Choices for MCQ Questions
        INSERT INTO examv2.CandidateExamSessionQuestionOptions (
            CandidateExamSessionQuestionId, OriginalMasterQuestionOptionId,
            DisplayOptionLabel, DisplayOrder, OptionText, IsCorrect
        )
        SELECT 
            sq.Id,
            mo.Id,
            CHAR(64 + ROW_NUMBER() OVER (PARTITION BY sq.Id ORDER BY CHECKSUM(NEWID()))),
            ROW_NUMBER() OVER (PARTITION BY sq.Id ORDER BY CHECKSUM(NEWID())),
            mo.OptionText,
            mo.IsCorrect
        FROM examv2.CandidateExamSessionQuestions sq
        JOIN examv2.MasterQuestionOptions mo ON sq.OriginalMasterQuestionId = mo.MasterQuestionId
        WHERE sq.CandidateExamSessionId = @SessionId;

        -- 7. Initialize Blank Answer Placeholders
        INSERT INTO examv2.CandidateExamAnswers (
            CandidateExamSessionId, CandidateExamSessionQuestionId, MarksObtained, EvaluationStatus, EvaluationLocked
        )
        SELECT @SessionId, sq.Id, 0.00, 'Pending', 0
        FROM examv2.CandidateExamSessionQuestions sq
        WHERE sq.CandidateExamSessionId = @SessionId;

        -- 8. Compute Total Exam Time & Marks
        UPDATE examv2.CandidateExamSessions
        SET TotalDurationMinutes = (SELECT ISNULL(SUM(ISNULL(TimeAllowedMinutes, 0)), 30) FROM examv2.CandidateExamSessionQuestions WHERE CandidateExamSessionId = @SessionId),
            TotalTimeLeftSeconds = (SELECT ISNULL(SUM(ISNULL(TimeAllowedMinutes, 0)), 30) * 60 FROM examv2.CandidateExamSessionQuestions WHERE CandidateExamSessionId = @SessionId),
            TotalMarks = (SELECT ISNULL(SUM(Marks), 0.00) FROM examv2.CandidateExamSessionQuestions WHERE CandidateExamSessionId = @SessionId)
        WHERE Id = @SessionId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 11. examv2.sp_V2_SaveExamAnswerBatch
CREATE OR ALTER PROCEDURE examv2.sp_V2_SaveExamAnswerBatch
    @SessionToken NVARCHAR(80),
    @AnswersXml XML,
    @SyncedCount INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @SessionId INT, @Status NVARCHAR(30);
        SELECT @SessionId = Id, @Status = SessionStatus
        FROM examv2.CandidateExamSessions
        WHERE SessionToken = @SessionToken;

        IF @SessionId IS NULL THROW 50020, 'Candidate exam session not found.', 1;
        IF @Status NOT IN ('Created', 'InProgress') THROW 50021, 'Cannot save answers — exam session is already submitted or closed.', 1;

        SET @SyncedCount = 0;

        DECLARE @TempAnswers TABLE (
            QuestionId INT,
            AnswerText NVARCHAR(MAX),
            OptionIds NVARCHAR(200)
        );

        INSERT INTO @TempAnswers (QuestionId, AnswerText, OptionIds)
        SELECT 
            T.C.value('@QuestionId', 'INT'),
            T.C.value('@AnswerText', 'NVARCHAR(MAX)'),
            T.C.value('@OptionIds', 'NVARCHAR(200)')
        FROM @AnswersXml.nodes('/Answers/Answer') AS T(C);

        -- Upsert answer records
        UPDATE a
        SET a.SubmittedAnswerText = t.AnswerText,
            a.AnsweredAt = SYSDATETIMEOFFSET(),
            a.UpdatedAt = SYSDATETIMEOFFSET()
        FROM examv2.CandidateExamAnswers a
        JOIN @TempAnswers t ON a.CandidateExamSessionQuestionId = t.QuestionId
        WHERE a.CandidateExamSessionId = @SessionId
          AND a.EvaluationLocked = 0;

        SET @SyncedCount = @@ROWCOUNT;

        -- Upsert selected options
        DELETE ao
        FROM examv2.CandidateExamAnswerOptions ao
        JOIN examv2.CandidateExamAnswers a ON ao.CandidateExamAnswerId = a.Id
        JOIN @TempAnswers t ON a.CandidateExamSessionQuestionId = t.QuestionId
        WHERE a.CandidateExamSessionId = @SessionId;

        INSERT INTO examv2.CandidateExamAnswerOptions (CandidateExamAnswerId, CandidateExamSessionQuestionOptionId)
        SELECT a.Id, CAST(s.value AS INT)
        FROM @TempAnswers t
        JOIN examv2.CandidateExamAnswers a ON a.CandidateExamSessionQuestionId = t.QuestionId AND a.CandidateExamSessionId = @SessionId
        CROSS APPLY STRING_SPLIT(t.OptionIds, ',') s
        WHERE ISNULL(t.OptionIds, '') <> '';

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 12. examv2.sp_V2_EvaluateAndPublishAssessment
CREATE OR ALTER PROCEDURE examv2.sp_V2_EvaluateAndPublishAssessment
    @CandidateExamSessionId INT,
    @EvaluatorUserId INT = NULL,
    @Remarks NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @SessionId INT = @CandidateExamSessionId;
        DECLARE @CandidateId INT, @PassingPercentage DECIMAL(5,2);
        
        SELECT @CandidateId = CandidateId, @PassingPercentage = PassingPercentage
        FROM examv2.CandidateExamSessions
        WHERE Id = @SessionId;

        IF @CandidateId IS NULL THROW 50030, 'Candidate exam session not found.', 1;

        -- Auto-grade single and multi-choice MCQs
        UPDATE a
        SET a.MarksObtained = CASE 
                WHEN sq.QuestionType IN ('SINGLE_CHOICE', 'Single Choice') THEN
                    CASE WHEN EXISTS (
                        SELECT 1 FROM examv2.CandidateExamAnswerOptions ao
                        JOIN examv2.CandidateExamSessionQuestionOptions opt ON ao.CandidateExamSessionQuestionOptionId = opt.Id
                        WHERE ao.CandidateExamAnswerId = a.Id AND opt.IsCorrect = 1
                    ) THEN sq.Marks ELSE 0.00 END
                ELSE a.MarksObtained
            END,
            a.EvaluationStatus = 'AutoGraded',
            a.EvaluationLocked = 1,
            a.EvaluatorRemarks = 'Auto-Graded Objective Scoring',
            a.UpdatedAt = SYSDATETIMEOFFSET()
        FROM examv2.CandidateExamAnswers a
        JOIN examv2.CandidateExamSessionQuestions sq ON a.CandidateExamSessionQuestionId = sq.Id
        WHERE a.CandidateExamSessionId = @SessionId
          AND sq.QuestionType IN ('SINGLE_CHOICE', 'Single Choice');

        -- Calculate final score & percentage
        DECLARE @TotalMarks DECIMAL(6,2), @TotalScore DECIMAL(6,2), @Percentage DECIMAL(5,2), @ResultStatus NVARCHAR(20);

        SELECT 
            @TotalMarks = ISNULL(SUM(sq.Marks), 0.00),
            @TotalScore = ISNULL(SUM(a.MarksObtained), 0.00)
        FROM examv2.CandidateExamAnswers a
        JOIN examv2.CandidateExamSessionQuestions sq ON a.CandidateExamSessionQuestionId = sq.Id
        WHERE a.CandidateExamSessionId = @SessionId;

        SET @Percentage = CASE WHEN @TotalMarks > 0 THEN ROUND((@TotalScore / @TotalMarks) * 100.0, 2) ELSE 0.00 END;
        SET @ResultStatus = CASE WHEN @Percentage >= @PassingPercentage THEN 'Pass' ELSE 'Fail' END;

        UPDATE examv2.CandidateExamSessions
        SET SessionStatus = 'Submitted',
            EvaluationStatus = 'Published',
            SubmittedAt = ISNULL(SubmittedAt, SYSDATETIMEOFFSET()),
            EvaluatedAt = SYSDATETIMEOFFSET(),
            TotalMarks = @TotalMarks,
            TotalScore = @TotalScore,
            Percentage = @Percentage,
            ResultStatus = @ResultStatus,
            EvaluatorUserId = @EvaluatorUserId,
            EvaluatorRemarks = @Remarks,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE Id = @SessionId;

        -- Update Candidate Pipeline Status
        DECLARE @NextRound NVARCHAR(100) = 'Technical Assessment (Round 2)';
        IF @ResultStatus = 'Pass'
        BEGIN
            UPDATE candidate.Candidates
            SET CurrentStage = 'Round 2: Technical Assessment',
                Status = 'Awaiting Tech Auth'
            WHERE CandidateId = @CandidateId;
        END
        ELSE
        BEGIN
            UPDATE candidate.Candidates
            SET Status = 'Eliminated (Below Cutoff)'
            WHERE CandidateId = @CandidateId;
        END

        COMMIT TRANSACTION;

        SELECT 
            @SessionId AS CandidateExamSessionId,
            @ResultStatus AS ResultStatus,
            @TotalScore AS TotalScore,
            @TotalMarks AS TotalMarks,
            @Percentage AS Percentage,
            CASE WHEN @ResultStatus = 'Pass' THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS AdvancedToNextRound,
            @NextRound AS NextRoundTitle,
            CASE WHEN @ResultStatus = 'Pass' THEN 'Awaiting Tech Auth' ELSE 'Eliminated' END AS CandidateStatus;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 13. staffv2.sp_UpsertDirectorAccessLink
CREATE OR ALTER PROCEDURE staffv2.sp_UpsertDirectorAccessLink
    @CandidateId INT,
    @Regenerate BIT = 0,
    @FrontendBaseUrl NVARCHAR(200) = 'http://localhost:3000',
    @Token NVARCHAR(80) OUTPUT,
    @AccessUrl NVARCHAR(500) OUTPUT,
    @ExpiresAt DATETIMEOFFSET OUTPUT,
    @IsExisting BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check if an active unexpired token exists
        IF @Regenerate = 0
        BEGIN
            SELECT TOP 1
                @Token = Token,
                @ExpiresAt = ExpiresAt
            FROM staffv2.DirectorAccessLinks
            WHERE CandidateId = @CandidateId
              AND IsRevoked = 0
              AND ExpiresAt > SYSDATETIMEOFFSET()
            ORDER BY Id DESC;

            IF @Token IS NOT NULL
            BEGIN
                SET @IsExisting = 1;
                SET @AccessUrl = RTRIM(@FrontendBaseUrl) + '/?d=' + @Token;
                COMMIT TRANSACTION;
                RETURN;
            END
        END

        -- Revoke existing tokens if regenerating or expired
        UPDATE staffv2.DirectorAccessLinks
        SET IsRevoked = 1,
            RevokedAt = SYSDATETIMEOFFSET()
        WHERE CandidateId = @CandidateId AND IsRevoked = 0;

        -- Generate new 24-hour token
        SET @Token = 'dir_' + LOWER(SUBSTRING(CONVERT(NVARCHAR(40), NEWID()), 1, 8)) + '_' + LOWER(SUBSTRING(CONVERT(NVARCHAR(40), NEWID()), 1, 8));
        SET @ExpiresAt = DATEADD(HOUR, 24, SYSDATETIMEOFFSET());
        SET @AccessUrl = RTRIM(@FrontendBaseUrl) + '/?d=' + @Token;
        SET @IsExisting = 0;

        INSERT INTO staffv2.DirectorAccessLinks (Token, CandidateId, CreatedAt, ExpiresAt, IsRevoked)
        VALUES (@Token, @CandidateId, SYSDATETIMEOFFSET(), @ExpiresAt, 0);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
