-- ====================================================================================
-- STEP Enterprise ATS - V2 Question Bank Seed Script
-- File: 05_SeedSurveyAssistantQuestions.sql
-- Role: Survey Assistant (RoleId: 8)
-- Track: Civil & Survey Assistant Aptitude & Technical Test (25 Questions | 30 Marks | 45 Mins)
-- Fully Idempotent (safe to re-run multiple times without duplicate records)
-- ====================================================================================

SET NOCOUNT ON;
GO

-- 1. Ensure Assessment Blueprint exists for Survey Assistant Track
IF NOT EXISTS (SELECT 1 FROM examv2.AssessmentBlueprints WHERE Code = 'RULE-SURV-ASST')
BEGIN
    INSERT INTO examv2.AssessmentBlueprints (
        Code, Name, DefaultPassingPercentage, TotalDurationMinutes, 
        TotalQuestions, TotalMarks, EnableQuestionShuffling, EnableOptionShuffling, 
        IsDefault, IsActive, CreatedBy
    )
    VALUES (
        'RULE-SURV-ASST', 'Survey Assistant Assessment Track', 70.00, 45, 
        25, 30.00, 1, 1, 
        0, 1, 'Survey Assistant Seeder'
    );

    DECLARE @BpId INT = SCOPE_IDENTITY();

    INSERT INTO examv2.AssessmentBlueprintSectionRules (
        BlueprintId, SectionName, SectionType, QuestionType, ExperienceTier, 
        RequiredTags, QuestionCount, MarksPerQuestion, TimeLimitMinutes, 
        SelectionStrategy, DisplayOrder, IsActive
    )
    VALUES 
    (@BpId, 'Section A - Basic Mathematics & Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher', 'Mathematics,Aptitude', 10, 1.00, 15, 'SequentialOrder', 1, 1),
    (@BpId, 'Section B, C & D - Technical Civil & Surveying', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher', 'Civil,Surveying,Marathi', 14, 1.00, 20, 'SequentialOrder', 2, 1),
    (@BpId, 'Section E - Handwriting & Language Assessment', 'SubjectiveTheory', 'SUBJECTIVE', 'Fresher', 'Handwriting,Marathi', 1, 6.00, 10, 'SequentialOrder', 3, 1);
END;
GO

-- 2. Helper Procedure for Idempotent Master Question Seeding
CREATE OR ALTER PROCEDURE #sp_SeedSurveyQuestion
    @Code NVARCHAR(30),
    @Language NVARCHAR(50),
    @SectionType NVARCHAR(30),
    @QuestionType NVARCHAR(30),
    @ExperienceTier NVARCHAR(30),
    @QuestionText NVARCHAR(MAX),
    @Marks DECIMAL(5,2),
    @OptA NVARCHAR(MAX) = NULL, @OptACorrect BIT = 0,
    @OptB NVARCHAR(MAX) = NULL, @OptBCorrect BIT = 0,
    @OptC NVARCHAR(MAX) = NULL, @OptCCorrect BIT = 0,
    @OptD NVARCHAR(MAX) = NULL, @OptDCorrect BIT = 0
AS
BEGIN
    DECLARE @QId INT;
    SELECT @QId = Id FROM examv2.MasterQuestions WHERE Code = @Code;

    IF @QId IS NULL
    BEGIN
        INSERT INTO examv2.MasterQuestions (
            Code, Language, SectionType, QuestionType, ExperienceTier, 
            QuestionText, Marks, IsActive, CreatedBy
        )
        VALUES (
            @Code, @Language, @SectionType, @QuestionType, @ExperienceTier, 
            @QuestionText, @Marks, 1, 'Survey Assistant Seeder'
        );

        SET @QId = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE examv2.MasterQuestions
        SET Language = @Language,
            SectionType = @SectionType,
            QuestionType = @QuestionType,
            ExperienceTier = @ExperienceTier,
            QuestionText = @QuestionText,
            Marks = @Marks,
            IsActive = 1,
            UpdatedBy = 'Survey Assistant Seeder',
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE Id = @QId;

        DELETE FROM examv2.MasterQuestionOptions WHERE MasterQuestionId = @QId;
    END

    IF @OptA IS NOT NULL INSERT INTO examv2.MasterQuestionOptions (MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder) VALUES (@QId, 'A', @OptA, @OptACorrect, 1);
    IF @OptB IS NOT NULL INSERT INTO examv2.MasterQuestionOptions (MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder) VALUES (@QId, 'B', @OptB, @OptBCorrect, 2);
    IF @OptC IS NOT NULL INSERT INTO examv2.MasterQuestionOptions (MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder) VALUES (@QId, 'C', @OptC, @OptCCorrect, 3);
    IF @OptD IS NOT NULL INSERT INTO examv2.MasterQuestionOptions (MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder) VALUES (@QId, 'D', @OptD, @OptDCorrect, 4);
END;
GO

-- ====================================================================================
-- SECTION A – BASIC MATHEMATICS & APTITUDE (10 Questions | 10 Marks)
-- ====================================================================================

-- Q1
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-001', 'Survey Assistant Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    N'What is 25% of 400?', 1.00,
    N'50', 0,
    N'75', 0,
    N'100', 1,
    N'125', 0;

-- Q2
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-002', 'Survey Assistant Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    N'A wall is 10 m long and 3 m high. What is its area?', 1.00,
    N'13 m²', 0,
    N'26 m²', 0,
    N'30 m²', 1,
    N'33 m²', 0;

-- Q3
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-003', 'Survey Assistant Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    N'Convert 2.5 meters into centimeters.', 1.00,
    N'25 cm', 0,
    N'250 cm', 1,
    N'2500 cm', 0,
    N'205 cm', 0;

-- Q4
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-004', 'Survey Assistant Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    N'If 1 bag of cement weighs 50 kg, what is the weight of 8 bags?', 1.00,
    N'300 kg', 0,
    N'350 kg', 0,
    N'400 kg', 1,
    N'450 kg', 0;

-- Q5
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-005', 'Survey Assistant Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    N'A room is 5 m × 4 m. What is its floor area?', 1.00,
    N'9 m²', 0,
    N'18 m²', 0,
    N'20 m²', 1,
    N'25 m²', 0;

-- Q6
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-006', 'Survey Assistant Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    N'Convert 1500 mm into meters.', 1.00,
    N'0.15 m', 0,
    N'1.5 m', 1,
    N'15 m', 0,
    N'150 m', 0;

-- Q7
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-007', 'Survey Assistant Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    N'A plot is 20 m long and 10 m wide. What is its perimeter?', 1.00,
    N'30 m', 0,
    N'40 m', 0,
    N'50 m', 0,
    N'60 m', 1;

-- Q8
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-008', 'Survey Assistant Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    N'A worker completes 12 m² of work in one day. How much will he complete in 5 days?', 1.00,
    N'50 m²', 0,
    N'60 m²', 1,
    N'70 m²', 0,
    N'72 m²', 0;

-- Q9
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-009', 'Survey Assistant Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    N'1 square meter is equal to:', 1.00,
    N'100 cm²', 0,
    N'1,000 cm²', 0,
    N'10,000 cm²', 1,
    N'100,000 cm²', 0;

-- Q10
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-010', 'Survey Assistant Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    N'A drawing scale is 1:100. If a wall is shown as 5 cm on the drawing, what is its actual length?', 1.00,
    N'50 cm', 0,
    N'1 m', 0,
    N'5 m', 1,
    N'10 m', 0;

-- ====================================================================================
-- SECTION B – MEASUREMENT & QUANTITY CALCULATION (5 Questions | 5 Marks)
-- ====================================================================================

-- Q11
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-011', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'Which instrument is commonly used to measure length at a construction site?', 1.00,
    N'Measuring tape', 1,
    N'Hammer', 0,
    N'Plumb bob', 0,
    N'Trowel', 0;

-- Q12
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-012', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'What is the usual unit for measuring concrete quantity?', 1.00,
    N'kg', 0,
    N'm', 0,
    N'm²', 0,
    N'm³', 1;

-- Q13
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-013', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'What is the usual unit for measuring plastering work?', 1.00,
    N'm', 0,
    N'm²', 1,
    N'm³', 0,
    N'kg', 0;

-- Q14
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-014', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'A slab is 5 m long, 4 m wide and 0.15 m thick. What is its volume?', 1.00,
    N'2 m³', 0,
    N'3 m³', 1,
    N'4 m³', 0,
    N'5 m³', 0;

-- Q15
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-015', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'What is the standard least count of a metric measuring tape marked in centimetres and millimetres?', 1.00,
    N'1 centimetre', 0,
    N'1 millimetre', 1,
    N'0.5 centimetres', 0,
    N'10 millimetres', 0;

-- ====================================================================================
-- SECTION C – BASIC SURVEYING (4 Questions | 4 Marks)
-- ====================================================================================

-- Q16
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-016', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'What is the main purpose of surveying?', 1.00,
    N'To paint buildings', 0,
    N'To measure and locate points on the ground', 1,
    N'To calculate cement quantity only', 0,
    N'To prepare salary sheets', 0;

-- Q17
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-017', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'Which instrument is commonly used for leveling work?', 1.00,
    N'Level instrument', 1,
    N'Hammer', 0,
    N'Measuring tape', 0,
    N'Chisel', 0;

-- Q18
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-018', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'What is a Benchmark (BM) in surveying?', 1.00,
    N'Material storage area', 0,
    N'A fixed point with known elevation', 1,
    N'Type of concrete', 0,
    N'Type of foundation', 0;

-- Q19
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-019', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'What is the purpose of a plumb bob?', 1.00,
    N'To measure horizontal distance', 0,
    N'To check vertical alignment', 1,
    N'To measure concrete strength', 0,
    N'To calculate area', 0;

-- ====================================================================================
-- SECTION D – BASIC CIVIL SITE KNOWLEDGE & MARATHI (5 Questions | 5 Marks)
-- ====================================================================================

-- Q20
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-020', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'What is the main purpose of a foundation?', 1.00,
    N'To decorate the building', 0,
    N'To transfer building loads safely to the ground', 1,
    N'To increase wall height', 0,
    N'To reduce roof area', 0;

-- Q21
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-021', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'What does RCC stand for?', 1.00,
    N'Road Cement Construction', 0,
    N'Reinforced Cement Concrete', 1,
    N'Ready Construction Cement', 0,
    N'Reinforced Concrete Column', 0;

-- Q22
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-022', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'Before taking site measurements, what should a Civil Assistant check first?', 1.00,
    N'Guess the dimensions', 0,
    N'Check the approved drawing and use proper instruments', 1,
    N'Start construction immediately', 0,
    N'Measure without recording', 0;

-- Q23
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-023', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'''दगडावरची रेघ'' या वाक्प्रचाराचा अचूक अर्थ ओळखा.', 1.00,
    N'दगडावर चित्र काढणे', 0,
    N'कधीही न बदलणारे किंवा खोटे न ठरणारे बोलणे', 1,
    N'कठीण काम करणे', 0,
    N'जुन्या गोष्टी आठवणे', 0;

-- Q24
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-024', 'Survey Assistant Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    N'''पाण्यात पाहणे'' या वाक्प्रचाराचा अर्थ काय होतो?', 1.00,
    N'पाण्यात स्वतःचे प्रतिबिंब पाहणे', 0,
    N'मत्सर किंवा द्वेष करणे', 1,
    N'पोहायला शिकणे', 0,
    N'एखाद्याचा शोध घेणे', 0;

-- ====================================================================================
-- SECTION E – HANDWRITING & MARATHI ASSESSMENT (1 Question | 6 Marks)
-- ====================================================================================

-- Q25
EXEC #sp_SeedSurveyQuestion 
    'QB-SA-025', 'Survey Assistant Aptitude', 'SubjectiveTheory', 'SUBJECTIVE', 'Fresher',
    N'Write the following paragraph neatly in your own handwriting:

निसर्गाचे महत्त्व
"निसर्ग हा मानवाचा सर्वात मोठा मित्र आणि शिक्षक आहे. आपल्या अवतीभोवती असणारे डोंगर, नद्या, झाडे आणि पशू-पक्षी हे सर्व निसर्गाचेच सुंदर रूप आहेत. निसर्ग आपल्याला जगण्यासाठी आवश्यक असणारी हवा, पाणी आणि अन्न अगदी मोफत देतो. झाडे आपल्याला सावली देतात, फुले सुवास देतात, तर नद्या आपले जीवन समृद्ध करतात."', 
    6.00;
GO

-- ====================================================================================
-- 3. Seed Default Vacancy & Question Paper for Survey Assistant (RoleId: 8)
-- ====================================================================================
DECLARE @SaRoleId INT;
SELECT @SaRoleId = MasterRoleId FROM master.MasterRoles WHERE Code = 'SA' OR Name = 'Survey Assistant';

IF @SaRoleId IS NOT NULL
BEGIN
    DECLARE @SaBpId INT;
    SELECT @SaBpId = Id FROM examv2.AssessmentBlueprints WHERE Code = 'RULE-SURV-ASST';

    -- Check if a vacancy exists for Survey Assistant
    DECLARE @SaVacId INT;
    SELECT TOP 1 @SaVacId = VacancyId FROM vacancy.Vacancies WHERE MasterRoleId = @SaRoleId AND Status = 'Active' AND IsDeleted = 0 ORDER BY VacancyId;

    IF @SaVacId IS NULL
    BEGIN
        -- Generate Next Vacancy Code
        DECLARE @NextNum INT = (SELECT ISNULL(MAX(VacancyId), 0) + 1 FROM vacancy.Vacancies);
        DECLARE @VacCode NVARCHAR(30) = CONCAT('VAC-2026-', @NextNum);

        INSERT INTO vacancy.Vacancies (
            VacancyCode, Title, MasterRoleId, DepartmentId, HiringLocationId, 
            EmploymentTypeId, DriveType, Status, WorkMode, TotalOpenings, 
            MinExperienceYears, MaxExperienceYears, JobDescription, ClosingDate, 
            WalkinDriveDate, WalkinStartTime, WalkinEndTime, CreatedBy, CreatedAt, 
            IsDeleted, AssessmentBlueprintId, PassingPercentageOverride
        )
        VALUES (
            @VacCode, 'Survey Assistant', @SaRoleId, 2, 5, 
            1, 'Walk-in Drive', 'Active', 'On-site', 10, 
            0.0, 1.0, 'Recruitment Drive for Survey Assistant (Survey Assistant Assessment Track - Fresher (0 Years)).', 
            DATEADD(MONTH, 2, GETDATE()), GETDATE(), '09:30:00', '18:00:00', 7, GETDATE(), 
            0, @SaBpId, 70.00
        );

        SET @SaVacId = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE vacancy.Vacancies 
        SET AssessmentBlueprintId = @SaBpId,
            JobDescription = 'Recruitment Drive for Survey Assistant (Survey Assistant Assessment Track - Fresher (0 Years)).'
        WHERE VacancyId = @SaVacId;

        UPDATE r
        SET r.Name = 'Round 2: Survey Assistant Assessment Track'
        FROM vacancy.VacancyPipelineFlowRounds r
        JOIN vacancy.VacancyPipelineFlows pf ON r.VacancyPipelineFlowId = pf.VacancyPipelineFlowId
        WHERE pf.VacancyId = @SaVacId AND r.RoundOrder = 2;
    END

    -- Seed question.VacancyQuestionPapers & question.VacancyQuestions for complete dual-engine compatibility
    IF NOT EXISTS (SELECT 1 FROM question.VacancyQuestionPapers WHERE VacancyId = @SaVacId)
    BEGIN
        INSERT INTO question.VacancyQuestionPapers (
            VacancyId, PaperCode, Title, PaperVersion, TotalQuestions, 
            TotalMarks, DurationMinutes, PassingPercentage, Status, 
            PublishedAt, PublishedById, CreatedBy, CreatedAt, IsDeleted, RowVersion
        )
        VALUES (
            @SaVacId, 'QP-SA-001', 'Survey Assistant Technical Assessment', 1, 25, 
            30.00, 45, 70.00, 'Published', 
            GETDATE(), 7, 7, GETDATE(), 0, 0x0000000000000001
        );

        DECLARE @QPaperId INT = SCOPE_IDENTITY();

        -- Insert all 25 questions into question.VacancyQuestions and question.VacancyQuestionOptions
        DECLARE @qIdx INT = 1;
        WHILE @qIdx <= 25
        BEGIN
            DECLARE @qCode NVARCHAR(30) = CONCAT('QB-SA-', RIGHT('000' + CAST(@qIdx AS NVARCHAR(10)), 3));
            DECLARE @qText NVARCHAR(MAX);
            DECLARE @qType NVARCHAR(30);
            DECLARE @qMarks DECIMAL(5,2);

            SELECT @qText = QuestionText, @qType = QuestionType, @qMarks = Marks
            FROM examv2.MasterQuestions WHERE Code = @qCode;

            IF @qText IS NOT NULL
            BEGIN
                INSERT INTO question.VacancyQuestions (
                    VacancyQuestionPaperId, QuestionNumber, Version, QuestionType, 
                    QuestionText, Marks, TimeAllowedMinutes, ProgrammingLanguage, 
                    CreatedBy, CreatedAt, IsDeleted, RowVersion
                )
                VALUES (
                    @QPaperId, @qIdx, 1, @qType, 
                    @qText, @qMarks, 2, 'Civil / Survey', 
                    7, GETDATE(), 0, 0x0000000000000001
                );

                DECLARE @VacQId INT = SCOPE_IDENTITY();

                -- Copy options
                INSERT INTO question.VacancyQuestionOptions (
                    VacancyQuestionId, OptionLabel, OptionText, IsCorrect, CreatedBy, CreatedAt, IsDeleted, RowVersion
                )
                SELECT @VacQId, OptionLabel, OptionText, IsCorrect, 7, GETDATE(), 0, 0x0000000000000001
                FROM examv2.MasterQuestionOptions
                WHERE MasterQuestionId = (SELECT Id FROM examv2.MasterQuestions WHERE Code = @qCode)
                ORDER BY DisplayOrder;
            END

            SET @qIdx = @qIdx + 1;
        END;
    END;
END;
GO

PRINT 'Survey Assistant Question Bank Seeding Completed Successfully!';
