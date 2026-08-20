-- ====================================================================================
-- STEP Enterprise ATS — Database Script 03: Seed Blueprints & Question Bank
-- Target Database: InterviewTestPortal
-- Schema: examv2
-- ====================================================================================

SET NOCOUNT ON;

-- 1. Seed Universal Assessment Blueprints
IF NOT EXISTS (SELECT 1 FROM examv2.AssessmentBlueprints WHERE Code = 'RULE-MCQ-ONLY')
BEGIN
    INSERT INTO examv2.AssessmentBlueprints (Code, Name, DefaultPassingPercentage, TotalDurationMinutes, TotalQuestions, TotalMarks, EnableQuestionShuffling, EnableOptionShuffling, IsDefault, IsActive, CreatedBy)
    VALUES ('RULE-MCQ-ONLY', 'Standard Assessment Track (MCQ Only)', 70.00, 30, 20, 20.00, 1, 1, 1, 1, 'System Seeder');

    DECLARE @BpMcqId INT = SCOPE_IDENTITY();
    INSERT INTO examv2.AssessmentBlueprintSectionRules (BlueprintId, SectionName, SectionType, QuestionType, ExperienceTier, RequiredTags, QuestionCount, MarksPerQuestion, TimeLimitMinutes, SelectionStrategy, DisplayOrder, IsActive)
    VALUES (@BpMcqId, 'General & Technical MCQs', 'TechnicalMCQ', 'SINGLE_CHOICE', '{InheritFromCandidateTier}', '{InheritFromRole}', 20, 1.00, 30, 'RandomShuffled', 1, 1);
END

IF NOT EXISTS (SELECT 1 FROM examv2.AssessmentBlueprints WHERE Code = 'RULE-TECH-ENG')
BEGIN
    INSERT INTO examv2.AssessmentBlueprints (Code, Name, DefaultPassingPercentage, TotalDurationMinutes, TotalQuestions, TotalMarks, EnableQuestionShuffling, EnableOptionShuffling, IsDefault, IsActive, CreatedBy)
    VALUES ('RULE-TECH-ENG', 'Software Engineering Technical Track', 70.00, 85, 28, 60.00, 1, 1, 0, 1, 'System Seeder');

    DECLARE @BpTechId INT = SCOPE_IDENTITY();
    INSERT INTO examv2.AssessmentBlueprintSectionRules (BlueprintId, SectionName, SectionType, QuestionType, ExperienceTier, RequiredTags, QuestionCount, MarksPerQuestion, TimeLimitMinutes, SelectionStrategy, DisplayOrder, IsActive)
    VALUES 
    (@BpTechId, 'Core Technical MCQs', 'TechnicalMCQ', 'SINGLE_CHOICE', '{InheritFromCandidateTier}', '{InheritFromRole}', 20, 1.00, 25, 'RandomShuffled', 1, 1),
    (@BpTechId, 'Algorithmic & Coding Sandbox', 'Coding', 'CODING', '{InheritFromCandidateTier}', '{InheritFromRole}', 5, 6.00, 45, 'RandomShuffled', 2, 1),
    (@BpTechId, 'System Design & Architecture', 'SubjectiveTheory', 'SUBJECTIVE', '{InheritFromCandidateTier}', '{InheritFromRole}', 3, 3.33, 15, 'RandomShuffled', 3, 1);
END

IF NOT EXISTS (SELECT 1 FROM examv2.AssessmentBlueprints WHERE Code = 'RULE-DATA-SQL')
BEGIN
    INSERT INTO examv2.AssessmentBlueprints (Code, Name, DefaultPassingPercentage, TotalDurationMinutes, TotalQuestions, TotalMarks, EnableQuestionShuffling, EnableOptionShuffling, IsDefault, IsActive, CreatedBy)
    VALUES ('RULE-DATA-SQL', 'Database & SQL Engineering Track', 70.00, 85, 28, 60.00, 1, 1, 0, 1, 'System Seeder');

    DECLARE @BpSqlId INT = SCOPE_IDENTITY();
    INSERT INTO examv2.AssessmentBlueprintSectionRules (BlueprintId, SectionName, SectionType, QuestionType, ExperienceTier, RequiredTags, QuestionCount, MarksPerQuestion, TimeLimitMinutes, SelectionStrategy, DisplayOrder, IsActive)
    VALUES 
    (@BpSqlId, 'SQL & Relational MCQs', 'TechnicalMCQ', 'SINGLE_CHOICE', '{InheritFromCandidateTier}', 'SQL,Database', 20, 1.00, 25, 'RandomShuffled', 1, 1),
    (@BpSqlId, 'Complex Query Writing Sandbox', 'SQLQuery', 'SQL', '{InheritFromCandidateTier}', 'SQL,Joins,Grouping,CTE', 5, 6.00, 45, 'RandomShuffled', 2, 1),
    (@BpSqlId, 'Database Optimization & Tuning', 'SubjectiveTheory', 'SUBJECTIVE', '{InheritFromCandidateTier}', 'Indexing,Transactions', 3, 3.33, 15, 'RandomShuffled', 3, 1);
END
GO

-- 2. Helper Procedure to Seed Questions & Options Safely
CREATE OR ALTER PROCEDURE #sp_SeedQuestion
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
    @OptD NVARCHAR(MAX) = NULL, @OptDCorrect BIT = 0,
    @SqlSchema NVARCHAR(MAX) = NULL,
    @StarterCode NVARCHAR(MAX) = NULL
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM examv2.MasterQuestions WHERE Code = @Code)
    BEGIN
        INSERT INTO examv2.MasterQuestions (Code, Language, SectionType, QuestionType, ExperienceTier, QuestionText, Marks, SqlSchema, StarterCode, IsActive, CreatedBy)
        VALUES (@Code, @Language, @SectionType, @QuestionType, @ExperienceTier, @QuestionText, @Marks, @SqlSchema, @StarterCode, 1, 'System Seeder');

        DECLARE @QId INT = SCOPE_IDENTITY();

        IF @OptA IS NOT NULL INSERT INTO examv2.MasterQuestionOptions (MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder) VALUES (@QId, 'A', @OptA, @OptACorrect, 1);
        IF @OptB IS NOT NULL INSERT INTO examv2.MasterQuestionOptions (MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder) VALUES (@QId, 'B', @OptB, @OptBCorrect, 2);
        IF @OptC IS NOT NULL INSERT INTO examv2.MasterQuestionOptions (MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder) VALUES (@QId, 'C', @OptC, @OptCCorrect, 3);
        IF @OptD IS NOT NULL INSERT INTO examv2.MasterQuestionOptions (MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder) VALUES (@QId, 'D', @OptD, @OptDCorrect, 4);
    END
END;
GO

-- ====================================================================================
-- SEED QUESTIONS: General Aptitude, .NET, React, SQL, Algorithms across tiers
-- ====================================================================================

-- --- General Aptitude & Logical Reasoning ---
EXEC #sp_SeedQuestion 'QB-APT-01', 'General Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train in meters?', 1.0,
    '150 meters', 1, '120 meters', 0, '180 meters', 0, '200 meters', 0;

EXEC #sp_SeedQuestion 'QB-APT-02', 'General Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'If 12 men can complete a work in 20 days, how many days will 15 men take to complete the same work?', 1.0,
    '16 days', 1, '14 days', 0, '18 days', 0, '22 days', 0;

EXEC #sp_SeedQuestion 'QB-APT-03', 'General Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is the compound interest on $10,000 for 2 years at 10% per annum compounded annually?', 1.0,
    '$2,100', 1, '$2,000', 0, '$2,250', 0, '$2,050', 0;

EXEC #sp_SeedQuestion 'QB-APT-04', 'General Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'In a code language, if SYSTEM is written as SYSMET, how is FRACTION written?', 1.0,
    'FRACNOIT', 0, 'CARFNOIT', 1, 'FRACTION', 0, 'CARTIONF', 0;

EXEC #sp_SeedQuestion 'QB-APT-05', 'General Aptitude', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both pipes are opened together, the time taken to fill the tank is:', 1.0,
    '12 minutes', 1, '15 minutes', 0, '10 minutes', 0, '25 minutes', 0;

-- --- C# (.NET) Core & Clean Architecture ---
EXEC #sp_SeedQuestion 'QB-DOT-01', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'What is the primary architectural difference between a class and a struct in C#?', 1.0,
    'Class is a reference type (heap allocated); Struct is a value type (stack allocated).', 1,
    'Structs support inheritance while classes do not.', 0,
    'There is no difference in memory allocation.', 0,
    'Structs cannot have constructors.', 0;

EXEC #sp_SeedQuestion 'QB-DOT-02', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'Which access modifier allows a member to be accessed only within its own assembly or derived classes?', 1.0,
    'protected internal', 1, 'private protected', 0, 'internal', 0, 'protected', 0;

EXEC #sp_SeedQuestion 'QB-DOT-03', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'In ASP.NET Core Dependency Injection, which lifetime creates a new instance once per client request?', 1.0,
    'Scoped', 1, 'Transient', 0, 'Singleton', 0, 'Static', 0;

EXEC #sp_SeedQuestion 'QB-DOT-04', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What happens if you execute `Task.Result` or `.Wait()` on an async method on the UI thread?', 1.0,
    'It can cause a thread deadlock due to SynchronizationContext blocking.', 1,
    'It speeds up async execution.', 0,
    'It automatically offloads work to a background thread.', 0,
    'It has no performance or concurrency impact.', 0;

EXEC #sp_SeedQuestion 'QB-DOT-05', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In Entity Framework Core, what is the effect of using `AsNoTracking()` on a query?', 1.0,
    'EF Core disables snapshot change tracking, improving read query performance and reducing memory usage.', 1,
    'EF Core deletes the entity from the database.', 0,
    'EF Core locks the table in read uncommitted isolation.', 0,
    'EF Core forces a full table scan.', 0;

EXEC #sp_SeedQuestion 'QB-DOT-06', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'Which memory feature in .NET is designed to represent contiguous regions of arbitrary memory with zero allocation overhead?', 1.0,
    'Span<T> and ReadOnlySpan<T>', 1, 'ArrayPool<T>', 0, 'MemoryStream', 0, 'GCHandle', 0;

EXEC #sp_SeedQuestion 'QB-DOT-07', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'In MediatR and Clean Architecture, what is the role of IPipelineBehavior<TRequest, TResponse>?', 1.0,
    'Cross-cutting middleware pipeline for logging, validation, and transaction management.', 1,
    'Direct database connection provider.', 0,
    'HTML template rendering engine.', 0,
    'Authentication token generator.', 0;

EXEC #sp_SeedQuestion 'QB-DOT-08', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Lead',
    'How does the Outbox Pattern solve data consistency between database state changes and message broker publishing?', 1.0,
    'Saves domain events in the same database transaction as business entities before background worker publishing.', 1,
    'Bypasses the database and sends messages directly over UDP.', 0,
    'Replaces the database with Redis cache.', 0,
    'Uses two-phase commit across all microservices.', 0;

-- --- JavaScript & React ---
EXEC #sp_SeedQuestion 'QB-JS-01', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'What is the output of `typeof null` in JavaScript?', 1.0,
    '"object"', 1, '"null"', 0, '"undefined"', 0, '"number"', 0;

EXEC #sp_SeedQuestion 'QB-JS-02', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'What is the primary benefit of the `useCallback` hook in React?', 1.0,
    'Memoizes a callback function reference across re-renders to prevent unnecessary child render cycles.', 1,
    'Executes side effects after the DOM paints.', 0,
    'Directly queries the server API.', 0,
    'Initializes global Redux store state.', 0;

EXEC #sp_SeedQuestion 'QB-JS-03', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'In the JavaScript Event Loop, which queue has priority after current execution call stack finishes: Microtasks or Macrotasks?', 1.0,
    'Microtask Queue (Promises, queueMicrotask) executes before any Macrotask (setTimeout).', 1,
    'Macrotask Queue executes first.', 0,
    'Both execute simultaneously in parallel threads.', 0,
    'Execution order is random.', 0;

EXEC #sp_SeedQuestion 'QB-JS-04', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is the purpose of the `key` prop in React lists?', 1.0,
    'Provides stable identity to elements so Virtual DOM diffing algorithm can track additions, removals, and reordering efficiently.', 1,
    'Styles the element with unique CSS.', 0,
    'Enables encryption of component data.', 0,
    'Sets the HTML tabindex attribute.', 0;

EXEC #sp_SeedQuestion 'QB-JS-05', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In Redux Toolkit / RTK Query, how does automatic tag invalidation optimize network requests?', 1.0,
    'Mutations invalidate tagged cache keys, causing subscribed query hooks to automatically refetch fresh server data.', 1,
    'Clears the entire browser local storage.', 0,
    'Forces a full page browser reload.', 0,
    'Converts REST requests to GraphQL.', 0;

EXEC #sp_SeedQuestion 'QB-JS-06', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What is React Server Components (RSC) primary architectural benefit over client-side Single Page Applications?', 1.0,
    'Zero client-side JS bundle overhead for static server components with direct database and backend resource access.', 1,
    'Runs React inside Web Workers.', 0,
    'Replaces CSS with server styles.', 0,
    'Disables all user event handlers.', 0;

-- --- SQL & Relational Databases ---
EXEC #sp_SeedQuestion 'QB-SQL-01', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'Which SQL clause is used to filter records after aggregate functions (e.g., COUNT, SUM, AVG)?', 1.0,
    'HAVING', 1, 'WHERE', 0, 'GROUP BY', 0, 'ORDER BY', 0;

EXEC #sp_SeedQuestion 'QB-SQL-02', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'What is the difference between `DELETE` and `TRUNCATE` in SQL Server?', 1.0,
    'TRUNCATE deallocates data pages with minimal transaction logging and resets identity; DELETE logs every row removal.', 1,
    'DELETE is faster than TRUNCATE.', 0,
    'TRUNCATE activates row-level DELETE triggers.', 0,
    'DELETE cannot have a WHERE clause.', 0;

EXEC #sp_SeedQuestion 'QB-SQL-03', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is the purpose of the `ROW_NUMBER() OVER (PARTITION BY DepartmentId ORDER BY Salary DESC)` window function?', 1.0,
    'Assigns a sequential integer to rows starting at 1 for each department sorted by highest salary.', 1,
    'Sums the salaries across all departments.', 0,
    'Deletes duplicate rows from the table.', 0,
    'Creates a physical clustered index on DepartmentId.', 0;

EXEC #sp_SeedQuestion 'QB-SQL-04', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is a Non-Clustered Index with Included Columns (INCLUDE) used for?', 1.0,
    'Creates a covering index that satisfies query requirements directly from leaf pages without key lookups.', 1,
    'Physically alters the table row order on disk.', 0,
    'Enforces primary key uniqueness across tables.', 0,
    'Compresses text columns.', 0;

EXEC #sp_SeedQuestion 'QB-SQL-05', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'Under which transaction isolation level do non-repeatable reads and phantom reads both get prevented without full serial locking in SQL Server?', 1.0,
    'SNAPSHOT isolation', 1, 'READ COMMITTED', 0, 'READ UNCOMMITTED', 0, 'REPEATABLE READ', 0;

EXEC #sp_SeedQuestion 'QB-SQL-06', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What is Parameter Sniffing in SQL Server and how can it lead to query plan regression?', 1.0,
    'The query optimizer compiles and caches a execution plan tailored to initial parameter values that performs poorly for atypical values.', 1,
    'SQL Server leaks database passwords over plain text.', 0,
    'A memory leak in SQL Server buffer pool.', 0,
    'An index fragmentation anomaly.', 0;

-- --- Coding & Sandbox Questions ---
EXEC #sp_SeedQuestion 'QB-COD-01', 'C# (.NET)', 'Coding', 'CODING', 'Junior',
    'Write a function `int[] TwoSum(int[] nums, int target)` that returns indices of the two numbers such that they add up to target in O(N) time complexity.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0,
    NULL,
    'public class Solution { public int[] TwoSum(int[] nums, int target) { /* Write your solution */ return new int[0]; } }';

EXEC #sp_SeedQuestion 'QB-COD-02', 'C# (.NET)', 'Coding', 'CODING', 'Mid-Level',
    'Implement a thread-safe LRU (Least Recently Used) Cache with `Get(key)` and `Put(key, value)` operations running in O(1) average time.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0,
    NULL,
    'public class LRUCache { public LRUCache(int capacity) { } public int Get(int key) { return -1; } public void Put(int key, int value) { } }';

EXEC #sp_SeedQuestion 'QB-COD-03', 'SQL', 'SQLQuery', 'SQL', 'Mid-Level',
    'Write a query to find the 2nd highest salary employee in each department. If a department has ties, list all tied employees.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0,
    'CREATE TABLE Employees (Id INT, Name VARCHAR(50), DepartmentId INT, Salary DECIMAL(10,2));',
    '-- Write your SQL query here using DENSE_RANK() or subquery';

-- --- Subjective Architecture Questions ---
EXEC #sp_SeedQuestion 'QB-SUB-01', 'C# (.NET)', 'SubjectiveTheory', 'SUBJECTIVE', 'Senior',
    'Explain how you would design an idempotency mechanism for payment or webhook API endpoints to prevent duplicate processing on network retry.', 3.33;

EXEC #sp_SeedQuestion 'QB-SUB-02', 'SQL', 'SubjectiveTheory', 'SUBJECTIVE', 'Senior',
    'Explain the key differences between Optimistic Concurrency Control (using row version / timestamp) and Pessimistic Locking (UPDLOCK / XLOCK). When should each be chosen?', 3.33;

EXEC #sp_SeedQuestion 'QB-SUB-03', 'JavaScript / React', 'SubjectiveTheory', 'SUBJECTIVE', 'Senior',
    'Explain how you would architect an offline-first data sync engine in a React web application with indexedDB buffering and server conflict resolution.', 3.33;

GO

DROP PROCEDURE #sp_SeedQuestion;
GO
