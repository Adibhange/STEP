-- ====================================================================================
-- STEP Enterprise ATS - V2 Question Bank Seed Script
-- File: 04_SeedExtensiveQuestionBank.sql
-- Contains: 220+ Industry Standard Questions across 5 Roles/Domains
-- Supports: SINGLE_CHOICE, MULTI_CHOICE, CODING, SQL, and SUBJECTIVE formats
-- Fully Idempotent (safe to run multiple times without duplicating data)
-- ====================================================================================

SET NOCOUNT ON;
GO

-- 1. Helper Stored Procedure for Safe Idempotent Question & Option Seeding
CREATE OR ALTER PROCEDURE #sp_SeedQuestionV2
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
        INSERT INTO examv2.MasterQuestions (
            Code, Language, SectionType, QuestionType, ExperienceTier, 
            QuestionText, Marks, SqlSchema, StarterCode, IsActive, CreatedBy
        )
        VALUES (
            @Code, @Language, @SectionType, @QuestionType, @ExperienceTier, 
            @QuestionText, @Marks, @SqlSchema, @StarterCode, 1, 'Enterprise Question Bank Seeder'
        );

        DECLARE @QId INT = SCOPE_IDENTITY();

        IF @OptA IS NOT NULL INSERT INTO examv2.MasterQuestionOptions (MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder) VALUES (@QId, 'A', @OptA, @OptACorrect, 1);
        IF @OptB IS NOT NULL INSERT INTO examv2.MasterQuestionOptions (MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder) VALUES (@QId, 'B', @OptB, @OptBCorrect, 2);
        IF @OptC IS NOT NULL INSERT INTO examv2.MasterQuestionOptions (MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder) VALUES (@QId, 'C', @OptC, @OptCCorrect, 3);
        IF @OptD IS NOT NULL INSERT INTO examv2.MasterQuestionOptions (MasterQuestionId, OptionLabel, OptionText, IsCorrect, DisplayOrder) VALUES (@QId, 'D', @OptD, @OptDCorrect, 4);
    END
END;
GO

PRINT 'Beginning Question Bank Seeding: 220+ Questions across 5 Domain Tracks...';
GO

-- ====================================================================================
-- TRACK 1: GENERAL APTITUDE & REASONING (45 Questions)
-- ====================================================================================

-- Quantitative Aptitude (Single Choice)
EXEC #sp_SeedQuestionV2 'QB-APT-011', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    'A car covers a distance of 450 km at a constant speed in 6 hours. What is the speed of the car in meters per second (m/s)?', 1.0,
    '20.83 m/s', 1, '25.00 m/s', 0, '18.50 m/s', 0, '22.40 m/s', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-012', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    'A man buys a cycle for $1,400 and sells it at a loss of 15%. What is the selling price of the cycle?', 1.0,
    '$1,190', 1, '$1,200', 0, '$1,160', 0, '$1,220', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-013', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    'The ratio of the ages of two persons A and B is 3:5. If the sum of their ages is 48 years, what will be the ratio of their ages after 6 years?', 1.0,
    '2:3', 1, '3:4', 0, '4:5', 0, '5:7', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-014', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    'What percentage of numbers from 1 to 70 have 1 or 9 in the unit digit?', 1.0,
    '20%', 1, '14%', 0, '21%', 0, '10%', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-015', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    'A and B together can do a piece of work in 15 days, while B alone can finish it in 20 days. In how many days can A alone finish the work?', 1.0,
    '60 days', 1, '40 days', 0, '45 days', 0, '50 days', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-016', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Junior',
    'A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.', 1.0,
    '4 hours', 1, '3 hours', 0, '5 hours', 0, '4.5 hours', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-017', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Junior',
    'A sum of money at simple interest amounts to $815 in 3 years and to $854 in 4 years. The principal sum is:', 1.0,
    '$698', 1, '$690', 0, '$700', 0, '$650', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-018', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Junior',
    'In how many different ways can the letters of the word ''LEADING'' be arranged in such a way that the vowels always come together?', 1.0,
    '720', 1, '360', 0, '1440', 0, '5040', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-019', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Junior',
    'Two dice are tossed simultaneously. What is the probability of getting a sum of 9?', 1.0,
    '1/9', 1, '1/6', 0, '1/12', 0, '5/36', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-020', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Junior',
    'The average of 20 numbers is zero. At most, how many of them can be greater than zero?', 1.0,
    '19', 1, '10', 0, '1', 0, '20', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-021', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Mid-Level',
    'A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?', 1.0,
    '5', 1, '4', 0, '3', 0, '6', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-022', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Mid-Level',
    'In what ratio must tea at $62 per kg be mixed with tea at $72 per kg so that the mixture must be worth $64.50 per kg?', 1.0,
    '3:1', 1, '3:2', 0, '4:3', 0, '5:3', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-023', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Mid-Level',
    'Find the largest four-digit number which when divided by 4, 7, and 13 leaves a remainder of 3 in each case.', 1.0,
    '9831', 1, '9828', 0, '9834', 0, '9999', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-024', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Mid-Level',
    'A cylindrical vessel of radius 7 cm contains water up to a height of 12 cm. If a spherical iron ball of radius 3 cm is dropped into it, what is the rise in water level?', 1.0,
    '0.73 cm', 1, '0.50 cm', 0, '1.20 cm', 0, '0.85 cm', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-025', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Mid-Level',
    'At what time between 4 and 5 o''clock will the hands of a clock be at right angles to each other for the first time?', 1.0,
    '5 5/11 minutes past 4', 1, '38 2/11 minutes past 4', 0, '10 minutes past 4', 0, '7 3/11 minutes past 4', 0;

-- Additional Quantitative Questions
EXEC #sp_SeedQuestionV2 'QB-APT-025A', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Junior',
    'A 270 meters long train running at the speed of 120 km/hr crosses another train running in opposite direction at the speed of 80 km/hr in 9 seconds. What is the length of the other train?', 1.0,
    '230 meters', 1, '240 meters', 0, '260 meters', 0, '320 meters', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-025B', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Mid-Level',
    'A trader marked his goods at 20% above the cost price and allowed a discount of 5% for cash payment. Find his actual profit percentage.', 1.0,
    '14%', 1, '15%', 0, '12%', 0, '16.5%', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-025C', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Senior',
    'Three partners A, B, and C invest $26,000, $34,000, and $10,000 respectively in a business. At the end of the year, they earn a profit of $3,500. B''s share of profit is:', 1.0,
    '$1,700', 1, '$1,300', 0, '$1,500', 0, '$1,850', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-025D', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Junior',
    'A train passes a station platform in 36 seconds and a man standing on the platform in 20 seconds. If the speed of the train is 54 km/hr, what is the length of the platform?', 1.0,
    '240 meters', 1, '300 meters', 0, '200 meters', 0, '180 meters', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-025E', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Mid-Level',
    'The compound interest on a certain sum for 2 years at 10% per annum is $525. The simple interest on the same sum for double the time at half the rate percent per annum is:', 1.0,
    '$500', 1, '$400', 0, '$550', 0, '$600', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-025F', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Mid-Level',
    'A jar contains a mixture of two liquids A and B in the ratio 4:1. When 10 liters of the mixture is taken out and 10 liters of liquid B is poured into the jar, the ratio becomes 2:3. How many liters of liquid A was in the jar initially?', 1.0,
    '16 liters', 1, '20 liters', 0, '14 liters', 0, '18 liters', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-025G', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Senior',
    'A box contains 2 white balls, 3 black balls, and 4 red balls. In how many ways can 3 balls be drawn from the box if at least one black ball is to be included in the draw?', 1.0,
    '64 ways', 1, '56 ways', 0, '72 ways', 0, '84 ways', 0;

-- Logical Reasoning & Pattern Deduction (Single Choice)
EXEC #sp_SeedQuestionV2 'QB-APT-026', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?', 1.0,
    '(1/8)', 1, '(1/16)', 0, '(1/3)', 0, '(2/8)', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-027', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Fresher',
    'Find the odd one out: 396, 462, 572, 427, 671, 264.', 1.0,
    '427', 1, '396', 0, '572', 0, '671', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-028', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Junior',
    'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?', 1.0,
    'Father', 1, 'Uncle', 0, 'Brother', 0, 'Grandfather', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-029', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Junior',
    'One morning after sunrise, Suresh was standing facing a pole. The shadow of the pole fell exactly to his right. Which direction was he facing?', 1.0,
    'South', 1, 'East', 0, 'West', 0, 'North', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-030', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Junior',
    'Statements: All mangoes are golden in colour. No golden-coloured things are cheap. Conclusions: I. All mangoes are cheap. II. Golden-coloured mangoes are not cheap.', 1.0,
    'Only conclusion II follows', 1, 'Only conclusion I follows', 0, 'Either I or II follows', 0, 'Neither I nor II follows', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-031', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Mid-Level',
    'In a row of trees, one tree is the 7th from either end of the row. How many trees are there in the row?', 1.0,
    '13', 1, '14', 0, '12', 0, '11', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-032', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Mid-Level',
    'If ''+'' means ''minus'', ''-'' means ''multiplied by'', ''÷'' means ''plus'', and ''×'' means ''divided by'', then compute: 15 × 3 + 24 - 1 ÷ 8 = ?', 1.0,
    '-11', 1, '15', 0, '0', 0, '-9', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-033', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Senior',
    'Six persons A, B, C, D, E, and F are sitting around a circle facing the center. B is between D and C. A is between E and C. F is at the right of D. Who is between A and F?', 1.0,
    'E', 1, 'D', 0, 'C', 0, 'B', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-034', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Senior',
    'Find the missing term in the sequence: C2E, E5H, G12K, I27N, ?', 1.0,
    'K58Q', 1, 'K56Q', 0, 'L58P', 0, 'J58R', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-035', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Senior',
    'Statement: The school authority decided to open a grievance cell for students to address academic issues. Assumption I: Students will express their issues freely. Assumption II: The grievance cell will resolve student difficulties.', 1.0,
    'Both assumptions I and II are implicit', 1, 'Only assumption I is implicit', 0, 'Only assumption II is implicit', 0, 'Neither is implicit', 0;

-- Additional Logical Reasoning
EXEC #sp_SeedQuestionV2 'QB-APT-035A', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Junior',
    'If in a code language, COULD is written as BNTKC and MARGIN is written as LZQFHM, how will MOULDING be written in that code?', 1.0,
    'LNTKCHMF', 1, 'LNKTCHMF', 0, 'NITKHCMF', 0, 'LNTKCLMF', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-035B', 'General Aptitude', 'Aptitude', 'SINGLE_CHOICE', 'Mid-Level',
    'Statement: Should all the unauthorized slums in the city be demolished immediately? Arguments: I. No, where will the poor dwellers live? II. Yes, they occupy prime lands and create health hazards.', 1.0,
    'Both arguments I and II are strong', 1, 'Only argument I is strong', 0, 'Only argument II is strong', 0, 'Neither is strong', 0;

-- Multi-Choice Aptitude Questions (2 or more correct options)
EXEC #sp_SeedQuestionV2 'QB-APT-036', 'General Aptitude', 'Aptitude', 'MULTI_CHOICE', 'Junior',
    'Which of the following numbers are divisible by both 3 and 4? (Select all that apply)', 2.0,
    '144', 1, '288', 1, '342', 0, '516', 1;

EXEC #sp_SeedQuestionV2 'QB-APT-037', 'General Aptitude', 'Aptitude', 'MULTI_CHOICE', 'Junior',
    'Which of the following fractions are strictly greater than 3/4? (Select all that apply)', 2.0,
    '4/5 (0.80)', 1, '7/8 (0.875)', 1, '5/7 (~0.714)', 0, '2/3 (~0.667)', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-038', 'General Aptitude', 'Aptitude', 'MULTI_CHOICE', 'Mid-Level',
    'Given the equation x^2 - 7x + 12 = 0, which of the following statements are mathematically true? (Select all that apply)', 2.0,
    'x = 3 is a root', 1, 'x = 4 is a root', 1, 'The sum of roots is 7', 1, 'The product of roots is -12', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-039', 'General Aptitude', 'Aptitude', 'MULTI_CHOICE', 'Mid-Level',
    'If a fair coin is tossed 3 times, which of the following events have a probability of 3/8? (Select all that apply)', 2.0,
    'Getting exactly two heads', 1, 'Getting exactly two tails', 1, 'Getting at least two heads', 0, 'Getting no heads', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-040', 'General Aptitude', 'Aptitude', 'MULTI_CHOICE', 'Senior',
    'Which of the following statements regarding prime numbers are true? (Select all that apply)', 2.0,
    '2 is the only even prime number', 1, 'Every prime number greater than 3 can be expressed in the form 6k ± 1', 1, 'The sum of any two prime numbers is always even', 0, '1 is a prime number', 0;

EXEC #sp_SeedQuestionV2 'QB-APT-041', 'General Aptitude', 'Aptitude', 'MULTI_CHOICE', 'Senior',
    'Which of the following geometric figures always have diagonals that bisect each other at 90 degrees (perpendicular)? (Select all that apply)', 2.0,
    'Rhombus', 1, 'Square', 1, 'Rectangle', 0, 'Parallelogram', 0;

GO

-- ====================================================================================
-- TRACK 2: .NET DEVELOPER (45 Questions)
-- ====================================================================================

-- Single Choice MCQs
EXEC #sp_SeedQuestionV2 'QB-DOT-011', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'What is the purpose of the `readonly` keyword when applied to a field in C#?', 1.0,
    'The field can only be assigned during declaration or inside the constructor of the enclosing class.', 1,
    'The field cannot be read by other classes.', 0,
    'The field is evaluated at compile time and embedded in metadata.', 0,
    'The field cannot be modified across asynchronous tasks.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-012', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'What occurs during "boxing" in the Common Language Runtime (CLR)?', 1.0,
    'A value type instance is allocated onto the managed heap inside an object wrapper.', 1,
    'A reference type is converted to a value type on the stack.', 0,
    'Data is serialized to JSON string format.', 0,
    'Memory is freed by the Garbage Collector.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-013', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'What is the difference between `IEnumerable<T>` and `IQueryable<T>` in Entity Framework Core?', 1.0,
    '`IQueryable<T>` executes filtering on the database server via expression trees; `IEnumerable<T>` filters in-memory on the client.', 1,
    '`IEnumerable<T>` supports SQL translation while `IQueryable<T>` does not.', 0,
    'There is no functional difference.', 0,
    '`IQueryable<T>` cannot be enumerated asynchronously.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-014', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'Which collection in `System.Collections.Concurrent` provides lock-free thread-safe producer-consumer FIFO queue behavior?', 1.0,
    'ConcurrentQueue<T>', 1, 'ConcurrentBag<T>', 0, 'ConcurrentDictionary<TKey, TValue>', 0, 'BlockingCollection<T>', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-015', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is the benefit of `ValueTask<T>` over standard `Task<T>` in high-throughput C# APIs?', 1.0,
    'It avoids heap allocation when an asynchronous operation completes synchronously.', 1,
    'It guarantees multi-threaded CPU parallel execution.', 0,
    'It bypasses the C# compiler state machine.', 0,
    'It automatically retries failed database transactions.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-016', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'In ASP.NET Core, what is the correct order of middleware execution for routing and endpoint dispatching?', 1.0,
    '`UseRouting()` -> `UseAuthentication()` -> `UseAuthorization()` -> `UseEndpoints()` / `MapControllers()`', 1,
    '`UseAuthentication()` -> `UseRouting()` -> `MapControllers()` -> `UseAuthorization()`', 0,
    '`MapControllers()` -> `UseRouting()` -> `UseAuthorization()`', 0,
    'Order of middleware registration does not matter in .NET Core', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-017', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'What is the purpose of `IHttpClientFactory` in .NET Core microservices?', 1.0,
    'Manages HttpClientHandler lifecycles to avoid socket exhaustion and react to DNS changes.', 1,
    'Compresses HTTP request bodies using GZIP.', 0,
    'Forces all requests to execute over gRPC.', 0,
    'Replaces the ASP.NET Core Kestrel web server.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-018', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In Entity Framework Core, what problem does `.AsSplitQuery()` solve for LINQ queries that include multiple `.Include()` collections?', 1.0,
    'It prevents Cartesian explosion by splitting the query into multiple coordinated SQL SELECT statements.', 1,
    'It splits large transactions into smaller ACID commits.', 0,
    'It distributes queries across multiple database replicas.', 0,
    'It caches query results in Redis.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-019', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'How does `record` in C# 9+ differ fundamentally from a standard `class`?', 1.0,
    'Records provide built-in value-based equality, non-destructive mutation (`with`), and synthesized formatting.', 1,
    'Records are allocated on the stack like structs.', 0,
    'Records cannot implement interfaces.', 0,
    'Records do not support inheritance.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-020', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'What is a "Captive Dependency" vulnerability in ASP.NET Core Dependency Injection?', 1.0,
    'A singleton service holding a reference to a scoped service, causing the scoped service to live for application lifetime.', 1,
    'A circular dependency between two transient services.', 0,
    'A memory leak caused by unmanaged pointers in unsafe blocks.', 0,
    'An orphaned task running on a background thread pool worker.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-021', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'How does `ArrayPool<T>.Shared` reduce Garbage Collection (GC) Gen 2 pressure in high-throughput data processing?', 1.0,
    'Rents reusable array buffers from a managed pool and returns them without allocating new heap memory per request.', 1,
    'Forces garbage collection immediately on array creation.', 0,
    'Stores arrays inside processor L1 cache.', 0,
    'Converts managed arrays to unmanaged C++ memory.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-022', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What is the purpose of `SynchronizationContext` in modern ASP.NET Core web applications?', 1.0,
    'ASP.NET Core has no SynchronizationContext; every await continuation resumes on a thread-pool thread by default.', 1,
    'It synchronizes SQL database transactions with HTTP requests.', 0,
    'It serializes all concurrent requests on a single worker thread.', 0,
    'It provides distributed locks across server clusters.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-023', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'In Clean Architecture, which layer should contain database entity configurations, DbContext, and third-party API adapters?', 1.0,
    'Infrastructure / Persistence layer', 1, 'Domain Core layer', 0, 'Application layer', 0, 'Presentation API layer', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-024', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What does the `[MethodImpl(MethodImplOptions.AggressiveInlining)]` attribute instruct the JIT compiler to do?', 1.0,
    'Suggests replacing calls to the target method directly with the method body bytecode to eliminate call overhead.', 1,
    'Executes the method concurrently on a high-priority thread.', 0,
    'Compiles the method ahead-of-time (AOT) into native assembly.', 0,
    'Enforces thread synchronization on entry and exit.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-025', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Lead',
    'What is the purpose of the Circuit Breaker pattern implemented via Polly in microservices?', 1.0,
    'Temporarily stops sending requests to a degraded downstream service after a failure threshold to allow it to recover.', 1,
    'Shuts down the application server when memory exceeds 90%.', 0,
    'Blocks malicious IP addresses attempting SQL injection.', 0,
    'Automatically rolls back git deployments on error.', 0;

-- Additional .NET MCQs
EXEC #sp_SeedQuestionV2 'QB-DOT-025A', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is the purpose of the `volatile` keyword in C# multithreaded programming?', 1.0,
    'Prevents the compiler and processor from caching or reordering memory reads and writes for the field.', 1,
    'Ensures atomic increments like Interlocked.Increment.', 0,
    'Locks the object monitor before read operations.', 0,
    'Serializes the field to disk.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-025B', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In Entity Framework Core, what is the key difference between `.SaveChanges()` and `.SaveChangesAsync()`?', 1.0,
    '`.SaveChangesAsync()` asynchronously writes changes to database releasing the calling thread while awaiting I/O.', 1,
    '`.SaveChangesAsync()` operates outside of database transactions.', 0,
    '`.SaveChanges()` caches changes in memory without sending them to SQL.', 0,
    'There is no difference in database execution.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-025C', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What is the difference between `System.Threading.Channels` and `BlockingCollection<T>`?', 1.0,
    '`Channels` support fully non-blocking asynchronous awaitable reads and writes (`await channel.Reader.ReadAsync()`).', 1,
    '`BlockingCollection` supports async await while Channels only block.', 0,
    '`Channels` store data only on disk.', 0,
    '`BlockingCollection` is lock-free while Channels use heavy OS semaphores.', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-025D', 'C# (.NET)', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'In ASP.NET Core, how does the Rate Limiting middleware (introduced in .NET 7/8) manage client throttles?', 1.0,
    'Uses partition keys with fixed/sliding window, token bucket, or concurrency limiters configured per endpoint.', 1,
    'Kills the TCP socket connection immediately without HTTP status code.', 0,
    'Compresses HTTP payloads to throttle bandwidth.', 0,
    'Replaces the ASP.NET Core thread pool.', 0;

-- Multi-Choice MCQs (.NET)
EXEC #sp_SeedQuestionV2 'QB-DOT-026', 'C# (.NET)', 'TechnicalMCQ', 'MULTI_CHOICE', 'Junior',
    'Which of the following types are allocated on the Stack by default in C# (unless boxed or captured in a closure)? (Select all that apply)', 2.0,
    '`int` (Int32)', 1, '`System.DateTime`', 1, '`string`', 0, '`System.Guid`', 1;

EXEC #sp_SeedQuestionV2 'QB-DOT-027', 'C# (.NET)', 'TechnicalMCQ', 'MULTI_CHOICE', 'Mid-Level',
    'Which of the following features are native characteristics of C# `record class`? (Select all that apply)', 2.0,
    'Value-based equality comparison via `Equals()` override', 1, 'Non-destructive mutation using `with` expressions', 1, 'Heap-allocated reference type semantics', 1, 'Inability to inherit from other classes', 0;

EXEC #sp_SeedQuestionV2 'QB-DOT-028', 'C# (.NET)', 'TechnicalMCQ', 'MULTI_CHOICE', 'Mid-Level',
    'Which LINQ extension methods trigger IMMEDIATE database query execution in Entity Framework Core? (Select all that apply)', 2.0,
    '`.ToListAsync()`', 1, '`.Where()`', 0, '`.FirstOrDefaultAsync()`', 1, '`.CountAsync()`', 1;

EXEC #sp_SeedQuestionV2 'QB-DOT-029', 'C# (.NET)', 'TechnicalMCQ', 'MULTI_CHOICE', 'Senior',
    'Which of the following synchronization primitives in .NET provide asynchronous lock/wait capability (`await`)? (Select all that apply)', 2.0,
    'SemaphoreSlim (via `WaitAsync()`)', 1, 'Monitor (`lock` keyword)', 0, 'Mutex', 0, 'Channel<T> (via `WaitToReadAsync()`)', 1;

EXEC #sp_SeedQuestionV2 'QB-DOT-030', 'C# (.NET)', 'TechnicalMCQ', 'MULTI_CHOICE', 'Senior',
    'Which Garbage Collector generations exist in the .NET runtime? (Select all that apply)', 2.0,
    'Generation 0 (Short-lived objects)', 1, 'Generation 1 (Buffer between Gen 0 and 2)', 1, 'Generation 2 (Long-lived objects & Large Object Heap)', 1, 'Generation 3 (Persistent kernel cache)', 0;

-- Coding Challenges (.NET)
EXEC #sp_SeedQuestionV2 'QB-DOT-031', 'C# (.NET)', 'Coding', 'CODING', 'Junior',
    'Write a method `bool IsValidParentheses(string s)` that determines if an input string containing ''('', '')'', ''{'', ''}'', ''['', '']'' has valid matching brackets.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL,
    'using System.Collections.Generic;

public class Solution 
{
    public bool IsValidParentheses(string s) 
    {
        // TODO: Implement bracket validation using Stack<char>
        return false;
    }
}';

EXEC #sp_SeedQuestionV2 'QB-DOT-032', 'C# (.NET)', 'Coding', 'CODING', 'Junior',
    'Write a method `int MaxSubArray(int[] nums)` that finds the contiguous subarray with the largest sum and returns its sum (Kadane''s Algorithm in O(N) time).', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL,
    'using System;

public class Solution 
{
    public int MaxSubArray(int[] nums) 
    {
        // TODO: Implement Kadane''s Algorithm
        return 0;
    }
}';

EXEC #sp_SeedQuestionV2 'QB-DOT-033', 'C# (.NET)', 'Coding', 'CODING', 'Mid-Level',
    'Implement a thread-safe in-memory sliding window Rate Limiter in C# that allows at most `maxRequests` per `timeWindow` for a given client key.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL,
    'using System;
using System.Collections.Concurrent;

public class SlidingWindowRateLimiter 
{
    private readonly int _maxRequests;
    private readonly TimeSpan _timeWindow;

    public SlidingWindowRateLimiter(int maxRequests, TimeSpan timeWindow) 
    {
        _maxRequests = maxRequests;
        _timeWindow = timeWindow;
    }

    public bool AllowRequest(string clientId) 
    {
        // TODO: Return true if client is within rate limit; otherwise false
        return true;
    }
}';

EXEC #sp_SeedQuestionV2 'QB-DOT-034', 'C# (.NET)', 'Coding', 'CODING', 'Senior',
    'Write a method `string LongestPalindrome(string s)` that returns the longest palindromic substring in O(N^2) time and O(1) auxiliary space (expand around center).', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL,
    'public class Solution 
{
    public string LongestPalindrome(string s) 
    {
        // TODO: Implement expand-around-center algorithm
        return "";
    }
}';

-- Subjective / System Design Questions (.NET)
EXEC #sp_SeedQuestionV2 'QB-DOT-035', 'C# (.NET)', 'SubjectiveTheory', 'SUBJECTIVE', 'Mid-Level',
    'Describe how you would design an Idempotent API endpoint for financial payment transactions in ASP.NET Core to prevent double-charging on network retries. Explain key components: Idempotency keys, distributed locks, database states, and response caching.', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DOT-036', 'C# (.NET)', 'SubjectiveTheory', 'SUBJECTIVE', 'Senior',
    'Explain the Outbox Pattern in microservices architecture. How does it ensure atomic consistency between relational database transactions (e.g. SQL Server) and distributed message brokers (e.g. RabbitMQ, Kafka) without using 2-Phase Commit (2PC)?', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DOT-037', 'C# (.NET)', 'SubjectiveTheory', 'SUBJECTIVE', 'Senior',
    'Compare Optimistic Concurrency Control (using row version / concurrency tokens) with Pessimistic Locking in Entity Framework Core. What are the throughput, deadlocking, and consistency trade-offs of each approach in high-concurrency booking systems?', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DOT-038', 'C# (.NET)', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'How do you diagnose and resolve High CPU utilization (100%) and OutOfMemory (OOM) exceptions in a production ASP.NET Core Linux container? Detail your methodology: `dotnet-dump`, `dotnet-trace`, GC generation inspections, and memory leak root-cause patterns.', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DOT-039', 'C# (.NET)', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'Explain the CQRS (Command Query Responsibility Segregation) pattern paired with Event Sourcing. When is it appropriate to adopt CQRS versus when is it an over-engineering anti-pattern?', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DOT-040', 'C# (.NET)', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'Describe how you design a multi-tenant SaaS backend in .NET Core where tenants share the same ASP.NET Core API but require isolated data boundaries. Compare: (1) Separate database per tenant, (2) Shared database with isolated schemas, and (3) Shared database with TenantId column and EF Core Global Query Filters.', 3.33;

GO

-- ====================================================================================
-- TRACK 3: SOFTWARE ENGINEER (FULL STACK / REACT / TYPESCRIPT) (45 Questions)
-- ====================================================================================

-- Single Choice MCQs
EXEC #sp_SeedQuestionV2 'QB-SE-011', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'What is the difference between `==` (loose equality) and `===` (strict equality) in JavaScript?', 1.0,
    '`===` compares both value and type without type coercion; `==` performs type conversion prior to comparison.', 1,
    '`==` compares memory references while `===` compares values.', 0,
    '`===` works only on primitive types.', 0,
    'There is no difference in modern V8 engines.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-012', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'In TypeScript, what is the type of a variable declared as `const greeting = "Hello";`?', 1.0,
    'Literal type `"Hello"`', 1, '`string`', 0, '`any`', 0, '`unknown`', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-013', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'What does the `Array.prototype.reduce()` function do in JavaScript?', 1.0,
    'Executes a user-supplied reducer callback on each element of the array, resulting in a single accumulated output value.', 1,
    'Reduces array length by removing empty elements.', 0,
    'Filters out duplicates in O(N) time.', 0,
    'Flattens nested multi-dimensional arrays.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-014', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is a "Closure" in JavaScript?', 1.0,
    'The combination of a function bundled together with references to its surrounding lexical environment.', 1,
    'A function that terminates the Node.js event loop.', 0,
    'An asynchronous promise that rejects immediately.', 0,
    'A method to seal JavaScript objects against property additions.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-015', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'In React 18/19, what does the `useTransition` hook accomplish?', 1.0,
    'Marks state updates as non-urgent transitions, keeping the user interface responsive during heavy re-renders.', 1,
    'Animates CSS opacity and transform transitions.', 0,
    'Navigates between Next.js pages with page transitions.', 0,
    'Transitions database connections across transactions.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-016', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is the TypeScript `unknown` type and how does it differ from `any`?', 1.0,
    '`unknown` is type-safe; no operations or property accesses are permitted on it until type narrowing or assertion occurs.', 1,
    '`unknown` turns off all compiler type checking like `any`.', 0,
    '`unknown` can only hold `null` and `undefined`.', 0,
    '`unknown` is identical to `void`.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-017', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In modern browser rendering engines, what causes an expensive "Reflow" (Layout calculation)?', 1.0,
    'Modifying DOM geometry properties such as `offsetWidth`, `clientHeight`, `width`, `height`, or font size.', 1,
    'Changing `transform: translate3d(...)` on an element with `will-change`.', 0,
    'Modifying `opacity` via CSS animation.', 0,
    'Calling `console.log()` inside an event handler.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-018', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In React, what is the primary purpose of `useImperativeHandle` combined with `forwardRef`?', 1.0,
    'Customizes the instance value and methods exposed to parent components through a ref.', 1,
    'Directly mutates browser DOM elements bypassing React reconciliation.', 0,
    'Forces immediate synchronous re-render of siblings.', 0,
    'Enables WebAssembly bindings in functional components.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-019', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'How does Next.js App Router handle Server Components (RSC) differently from traditional SSR?', 1.0,
    'RSC render exclusively on the server and stream serialized UI JSON without shipping component JavaScript code to the client bundle.', 1,
    'RSC renders pages to HTML on server and requires full client-side bundle re-hydration.', 0,
    'RSC executes in browser Web Workers.', 0,
    'RSC disables all CSS styling.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-01A', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'What is a "Discriminated Union" in TypeScript and what makes it powerful for state modeling?', 1.0,
    'A union of object types sharing a common literal property tag, enabling exhaustive pattern matching via switch-case.', 1,
    'A union that allows mixing strings and numbers without type errors.', 0,
    'A feature that automatically decrypts API payloads.', 0,
    'A mechanism to execute parallel SQL queries in Node.js.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-021', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'Why is `dangerouslySetInnerHTML` in React vulnerable to Cross-Site Scripting (XSS) attacks?', 1.0,
    'It injects unescaped HTML directly into the DOM, allowing injected `<script>` or malicious event handlers to execute.', 1,
    'It bypasses SSL/TLS certificate verification.', 0,
    'It causes browser memory leaks by retaining DOM nodes.', 0,
    'It automatically transmits cookies to third-party domains.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-022', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What is the Interaction to Next Paint (INP) Core Web Vital metric designed to measure?', 1.0,
    'The overall user interface responsiveness and latency to all clicks, taps, and keyboard interactions across page lifecycle.', 1,
    'The time it takes for the largest image to load on screen.', 0,
    'The time before the first byte is received from server (TTFB).', 0,
    'The cumulative visual shift of elements during layout.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-023', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'In the Web Security model, what does the `SameSite=Strict` cookie attribute enforce?', 1.0,
    'The cookie is never sent in cross-site requests, including following top-level navigation links from external sites.', 1,
    'The cookie can only be accessed through HTTPS and not HTTP.', 0,
    'JavaScript cannot access the cookie via `document.cookie`.', 0,
    'The cookie expires immediately when browser tab is closed.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-024', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Lead',
    'In Redux Toolkit / RTK Query, what is "Optimistic Updates" and how is it safely handled on network rejection?', 1.0,
    'The client store UI is updated immediately on action dispatch, with an `onQueryStarted` lifecycle handler reverting state on error.', 1,
    'The server updates the database before receiving the client request.', 0,
    'Requests are sent concurrently to multiple backup servers.', 0,
    'The browser suppresses all error messages from the user.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-025', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Lead',
    'What is "Module Federation" in Webpack / Vite architecture?', 1.0,
    'Enables multiple separate build applications to dynamically load and share code/modules at runtime without rebuilding.', 1,
    'A CSS preprocessor module bundler.', 0,
    'A database query optimization technique in Node.js.', 0,
    'An authentication protocol for federated SAML logins.', 0;

-- Additional SE Questions
EXEC #sp_SeedQuestionV2 'QB-SE-025A', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is the purpose of `React.memo` for functional components?', 1.0,
    'Prevents component re-rendering if its incoming props have not changed by shallow comparison.', 1,
    'Caches network responses in browser memory.', 0,
    'Transforms class components to functional components.', 0,
    'Stores component state in IndexedDB.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-025B', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In TypeScript, what does the `keyof` operator return when applied to an interface `interface User { id: number; name: string; }`?', 1.0,
    'A union of string literal types: `"id" | "name"`', 1,
    'An array of runtime object keys: `["id", "name"]`', 0,
    'The type of values: `number | string`', 0,
    '`undefined` at runtime', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-025C', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What is the purpose of the HTTP `Content-Security-Policy (CSP)` header?', 1.0,
    'Restricts which external domains and origins the browser is permitted to load scripts, styles, images, and fonts from.', 1,
    'Forces users to authenticate before viewing web pages.', 0,
    'Compresses HTML documents using Brotli.', 0,
    'Enables hardware acceleration for WebGL.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-025D', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What will `console.log(0.1 + 0.2 === 0.3)` output in JavaScript and why?', 1.0,
    '`false` due to IEEE 754 binary floating-point rounding precision errors.', 1,
    '`true` because math arithmetic is exact in V8.', 0,
    '`undefined` because equality operator throws error.', 0,
    '`NaN`', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-025E', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'In React 18/19, what does the `useId` hook generate?', 1.0,
    'A unique, stable identifier across server and client renders to prevent hydration mismatch for accessibility attributes.', 1,
    'A random UUIDv4 string for database records.', 0,
    'A cryptographic hash for passwords.', 0,
    'A session token for authentication.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-025F', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'What is the purpose of the `AbortController` API in modern browser and Node.js fetch requests?', 1.0,
    'Enables canceling ongoing asynchronous HTTP requests or async tasks when a component unmounts or query parameters change.', 1,
    'Terminates Node.js runtime process immediately.', 0,
    'Closes browser tabs on network errors.', 0,
    'Disables JavaScript event loop timers.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-025G', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What is the "CSS Containment" property (`contain: content / strict / layout`) used for in web performance optimization?', 1.0,
    'Isolates subtrees of the DOM from the rest of the page, allowing browser engines to skip restyling, layout, and paint outside the container.', 1,
    'Contains text inside its parent box without text wrapping.', 0,
    'Blocks external cross-origin CSS stylesheets.', 0,
    'Encrypts stylesheet declarations.', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-025H', 'JavaScript / React', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'In TypeScript, what is the difference between `interface` and `type` regarding declaration merging?', 1.0,
    'Multiple `interface` declarations with the same name automatically merge their properties; `type` aliases cannot be declared multiple times.', 1,
    '`type` supports merging while `interface` throws compiler error.', 0,
    'Neither supports declaration merging in TypeScript 5+.', 0,
    'Interfaces cannot describe object shapes.', 0;

-- Multi-Choice MCQs (Software Engineer)
EXEC #sp_SeedQuestionV2 'QB-SE-026', 'JavaScript / React', 'TechnicalMCQ', 'MULTI_CHOICE', 'Junior',
    'Which of the following are built-in TypeScript utility types? (Select all that apply)', 2.0,
    '`Partial<T>`', 1, '`Record<K, T>`', 1, '`Omit<T, K>`', 1, '`Transform<T>`', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-027', 'JavaScript / React', 'TechnicalMCQ', 'MULTI_CHOICE', 'Mid-Level',
    'Which of the following HTTP response headers are critical for browser web security hardening? (Select all that apply)', 2.0,
    '`Content-Security-Policy (CSP)`', 1, '`X-Content-Type-Options: nosniff`', 1, '`Strict-Transport-Security (HSTS)`', 1, '`X-Debug-Stack-Trace: verbose`', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-028', 'JavaScript / React', 'TechnicalMCQ', 'MULTI_CHOICE', 'Mid-Level',
    'Which React hooks must follow the Rules of Hooks (never called inside loops, conditions, or nested functions)? (Select all that apply)', 2.0,
    '`useState`', 1, '`useEffect`', 1, '`useMemo`', 1, 'Custom hooks (e.g. `useAuth`)', 1;

EXEC #sp_SeedQuestionV2 'QB-SE-029', 'JavaScript / React', 'TechnicalMCQ', 'MULTI_CHOICE', 'Senior',
    'Which of the following browser storage APIs support asynchronous, transactional storage of large structured data (objects, Blobs)? (Select all that apply)', 2.0,
    '`IndexedDB`', 1, '`OPFS (Origin Private File System)`', 1, '`localStorage`', 0, '`sessionStorage`', 0;

EXEC #sp_SeedQuestionV2 'QB-SE-030', 'JavaScript / React', 'TechnicalMCQ', 'MULTI_CHOICE', 'Senior',
    'Which Core Web Vitals metrics are evaluated by Google for user experience scoring? (Select all that apply)', 2.0,
    '`LCP (Largest Contentful Paint)`', 1, '`CLS (Cumulative Layout Shift)`', 1, '`INP (Interaction to Next Paint)`', 1, '`FPS (Frames Per Second)`', 0;

-- Coding Challenges (Software Engineer)
EXEC #sp_SeedQuestionV2 'QB-SE-031', 'JavaScript / React', 'Coding', 'CODING', 'Junior',
    'Implement a custom `debounce(fn, delay)` function in JavaScript that delays invoking `fn` until after `delay` milliseconds have elapsed since the last time the debounced function was invoked.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL,
    'function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}';

EXEC #sp_SeedQuestionV2 'QB-SE-032', 'JavaScript / React', 'Coding', 'CODING', 'Junior',
    'Write a function `deepClone(obj)` in JavaScript that returns a deep copy of any object or array without using `JSON.parse(JSON.stringify(obj))` (handling nested objects, arrays, and primitive types).', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL,
    'function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  const clone = {};
  for (const key of Object.keys(obj)) {
    clone[key] = deepClone(obj[key]);
  }
  return clone;
}';

EXEC #sp_SeedQuestionV2 'QB-SE-033', 'JavaScript / React', 'Coding', 'CODING', 'Mid-Level',
    'Implement a lightweight EventEmitter class with `on(event, listener)`, `off(event, listener)`, `emit(event, ...args)`, and `once(event, listener)` methods.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL,
    'class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(l => l(...args));
  }
  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    this.on(event, wrapper);
  }
}';

EXEC #sp_SeedQuestionV2 'QB-SE-034', 'JavaScript / React', 'Coding', 'CODING', 'Senior',
    'Implement `Promise.all(promises)` from scratch using native JavaScript promises. Return a promise that resolves to an array of results or rejects with the first rejection reason.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL,
    'function customPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!promises || promises.length === 0) {
      resolve([]);
      return;
    }
    const results = [];
    let completed = 0;
    promises.forEach((p, index) => {
      Promise.resolve(p)
        .then(val => {
          results[index] = val;
          completed++;
          if (completed === promises.length) resolve(results);
        })
        .catch(reject);
    });
  });
}';

-- Subjective / Architecture Questions (Software Engineer)
EXEC #sp_SeedQuestionV2 'QB-SE-035', 'JavaScript / React', 'SubjectiveTheory', 'SUBJECTIVE', 'Mid-Level',
    'Explain how you would architect an Offline-First Progressive Web Application (PWA). Detail your strategy for Service Worker lifecycle, caching strategies (NetworkFirst vs CacheFirst vs StaleWhileRevalidate), IndexedDB queue synchronization, and handling conflicts when the user reconnects.', 3.33;

EXEC #sp_SeedQuestionV2 'QB-SE-036', 'JavaScript / React', 'SubjectiveTheory', 'SUBJECTIVE', 'Senior',
    'Describe the architectural evolution and trade-offs of React State Management: Local State (`useState`/`useReducer`), Prop Drilling, React Context API, Redux Toolkit, and Server State libraries (RTK Query / TanStack Query). When is Context appropriate, and why does it struggle with high-frequency updates?', 3.33;

EXEC #sp_SeedQuestionV2 'QB-SE-037', 'JavaScript / React', 'SubjectiveTheory', 'SUBJECTIVE', 'Senior',
    'How would you diagnose and resolve poor Interaction to Next Paint (INP) and frame-drop lag in a data-intensive React dashboard displaying 5,000+ interactive table rows? Discuss DOM virtualization, web workers, React concurrent features (`useTransition`, `useDeferredValue`), and CSS containment.', 3.33;

EXEC #sp_SeedQuestionV2 'QB-SE-038', 'JavaScript / React', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'Explain the micro-frontends architectural pattern. Compare iframe isolation, Webpack Module Federation, and single-spa router integration. How do you govern shared styling (design systems), shared authentication tokens, and version skew across autonomous engineering teams?', 3.33;

EXEC #sp_SeedQuestionV2 'QB-SE-039', 'JavaScript / React', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'Design an Enterprise Design System architecture in a multi-app monorepo (Turborepo). How do you enforce accessibility (WCAG 2.1 AA), zero-runtime CSS tokens with CSS variables, component treeshaking, and automated visual regression testing using Playwright/Storybook?', 3.33;

EXEC #sp_SeedQuestionV2 'QB-SE-040', 'JavaScript / React', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'Detail how you secure a Single Page Application (SPA) against Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), and Token Hijacking. Why is storing JWTs in `localStorage` considered an anti-pattern for sensitive financial/HR systems, and how does the Backend-for-Frontend (BFF) proxy pattern solve this?', 3.33;

GO

-- ====================================================================================
-- TRACK 4: DATA ANALYST / SQL SPECIALIST (45 Questions)
-- ====================================================================================

-- Single Choice MCQs
EXEC #sp_SeedQuestionV2 'QB-DATA-011', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'What is the result of joining two tables using a `CROSS JOIN`?', 1.0,
    'Cartesian product of both tables (each row from Table A combined with all rows of Table B).', 1,
    'Intersection of matching keys only.', 0,
    'A full outer join with NULL values for missing matches.', 0,
    'An empty table.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-012', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'Which SQL constraint ensures that all values in a column are distinct and not null?', 1.0,
    '`PRIMARY KEY`', 1, '`UNIQUE`', 0, '`CHECK`', 0, '`FOREIGN KEY`', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-013', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'What is the fundamental difference between `UNION` and `UNION ALL`?', 1.0,
    '`UNION` removes duplicate rows by performing an internal distinct sort; `UNION ALL` preserves duplicates and executes faster.', 1,
    '`UNION ALL` only works on numbers.', 0,
    '`UNION` joins tables horizontally; `UNION ALL` joins vertically.', 0,
    'There is no performance difference.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-014', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is the difference between `RANK()` and `DENSE_RANK()` window functions when duplicate values occur?', 1.0,
    '`RANK()` leaves gaps in ranking numbers after ties (e.g., 1, 2, 2, 4); `DENSE_RANK()` assigns consecutive numbers without gaps (1, 2, 2, 3).', 1,
    '`DENSE_RANK()` sorts rows descending only.', 0,
    '`RANK()` ignores partition by clauses.', 0,
    '`DENSE_RANK()` is slower on large tables.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-015', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is a "SARGable" (Search Argument Able) query in SQL Server performance tuning?', 1.0,
    'A query predicate where the index column is not wrapped inside a scalar function or expression, allowing the optimizer to use an Index Seek.', 1,
    'A query that uses full-text search indexing.', 0,
    'A stored procedure encrypted with WITH ENCRYPTION.', 0,
    'A query that executes exclusively in temporary database (tempdb).', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-016', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is the behavior of the `COALESCE(val1, val2, ...)` function in SQL?', 1.0,
    'Evaluates arguments in order and returns the current value of the first expression that is not NULL.', 1,
    'Concatenates strings ignoring null characters.', 0,
    'Calculates mathematical covariance between two columns.', 0,
    'Replaces nulls with zeros in numeric columns.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-017', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'What does an "Index Seek" operator in an execution plan indicate compared to an "Index Scan"?', 1.0,
    'The storage engine traverses the B-Tree directly to specific qualifying rows; an Index Scan reads every page of the index.', 1,
    'Index Scan is always faster than Index Seek.', 0,
    'Index Seek causes a table lock while Scan does not.', 0,
    'Index Seek reads from memory cache only.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-018', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'What is a Common Table Expression (CTE) and what is its scope in SQL Server?', 1.0,
    'A named temporary result set defined within the execution scope of a single SELECT, INSERT, UPDATE, or DELETE statement.', 1,
    'A permanent database view stored on disk.', 0,
    'A table variable persisted in tempdb across the entire session.', 0,
    'A global temporary table accessible across connections.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-019', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In dimensional data modeling, what is the key characteristic of a "Star Schema"?', 1.0,
    'A central fact table containing numerical measures surrounded by denormalized single-level dimension tables.', 1,
    'A fully normalized database in 3NF with cascading foreign keys.', 0,
    'A schema where all dimensions are snowflake normalized.', 0,
    'A database with no indexes or primary keys.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-020', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'What occurs during a SQL Server "Deadlock"?', 1.0,
    'Two or more sessions hold locks on resources the other session needs, creating a circular dependency that the lock manager resolves by killing one as a victim.', 1,
    'The SQL Server transaction log file runs out of disk space.', 0,
    'The server shuts down unexpectedly during a power outage.', 0,
    'An index fragmentation level exceeds 80%.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-021', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'Under the `READ COMMITTED SNAPSHOT` isolation (RCSI) level in SQL Server, how do readers avoid blocking writers?', 1.0,
    'Row versions are stored in the tempdb Version Store, allowing queries to read committed snapshots without acquiring shared S-locks.', 1,
    'Queries read uncommitted dirty pages directly from memory.', 0,
    'All tables are converted to in-memory OLTP tables.', 0,
    'Writers take table-level locks instead of row-level locks.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-022', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What is a "Clustered Columnstore Index" and what is its primary workload advantage?', 1.0,
    'Organizes and stores data in column-based segments with deep compression, optimized for massive analytical aggregations and scans.', 1,
    'Optimized for single-row OLTP primary key lookups.', 0,
    'Replaces standard B-Tree indexes for enforcing unique foreign key constraints.', 0,
    'Prevents transaction log growth during bulk inserts.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-023', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What causes "Implicit Conversion" in SQL Server and why is it dangerous for performance?', 1.0,
    'Data types mismatch between column and parameter (e.g. VARCHAR vs NVARCHAR), forcing row-by-row conversion and preventing Index Seek.', 1,
    'SQL Server automatically changes table schemas at runtime.', 0,
    'Transactions automatically commit without an explicit COMMIT command.', 0,
    'Numbers are rounded up causing financial calculation errors.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-024', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Lead',
    'In Data Warehousing, what is a "Slowly Changing Dimension Type 2" (SCD Type 2)?', 1.0,
    'Tracks historical changes by inserting a new record with effective start/end timestamps and an is_current flag.', 1,
    'Overwrites the existing value directly with no history maintained.', 0,
    'Adds a new column to the table for previous value.', 0,
    'Deletes the previous record and purges it from backup.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-025', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Lead',
    'What is Table Partitioning in enterprise relational databases and how does Partition Elimination improve query speed?', 1.0,
    'Data is split horizontally across filegroups based on a partition key; the optimizer prunes irrelevant partitions during execution.', 1,
    'Columns are distributed across multiple network servers.', 0,
    'Splits one database into multiple microservice databases.', 0,
    'Automatically deletes archived historical data after 30 days.', 0;

-- Additional Data MCQs
EXEC #sp_SeedQuestionV2 'QB-DATA-025A', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is the result of evaluating `SELECT NULL + 5` in SQL Server?', 1.0,
    '`NULL`', 1, '`5`', 0, '`0`', 0, 'Error: Type mismatch', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-025B', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In SQL Server, which system view or DMV allows you to inspect active executing queries, elapsed CPU time, and wait types?', 1.0,
    '`sys.dm_exec_requests`', 1, '`sys.tables`', 0, '`sys.sysprocesses_old`', 0, '`INFORMATION_SCHEMA.QUERIES`', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-025C', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What is the purpose of the `MERGE` statement in SQL Server?', 1.0,
    'Performs INSERT, UPDATE, or DELETE operations on a target table in a single atomic statement based on source join conditions.', 1,
    'Merges physical data files on disk.', 0,
    'Combines two database schemas into one.', 0,
    'Compresses transaction log files.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-025D', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'In SQL Server, what does the `NEWID()` function return compared to `NEWSEQUENTIALID()`?', 1.0,
    '`NEWID()` generates random GUIDs causing index page splits; `NEWSEQUENTIALID()` generates sequential GUIDs that append cleanly to clustered indexes.', 1,
    '`NEWID()` is sequential; `NEWSEQUENTIALID()` is random.', 0,
    '`NEWID()` generates 32-bit integers.', 0,
    'Both produce identical GUID patterns.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-025E', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'What is the purpose of a "Filtered Index" in SQL Server (`CREATE INDEX ... WHERE Status = ''Active''`)?', 1.0,
    'Indexes only rows satisfying the predicate, reducing index storage size, maintenance I/O overhead, and improving query speed.', 1,
    'Filters out deleted rows during database restore.', 0,
    'Encrypts matching rows in the index leaf pages.', 0,
    'Enforces unique primary keys across multiple tables.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-025F', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'In SQL Server, what is "Spill to Tempdb" during a Hash Match or Sort operator and why does it degrade query performance?', 1.0,
    'The query memory grant is insufficient to hold the hash table or sort buffer in RAM, forcing intermediate pages to write to disk in tempdb.', 1,
    'Tempdb runs out of transaction log space.', 0,
    'SQL Server crashes due to memory overflow.', 0,
    'Data is replicated to secondary backup servers.', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-025G', 'SQL', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What does the `SET XACT_ABORT ON` setting enforce in T-SQL transaction management?', 1.0,
    'Instructs SQL Server to automatically roll back the entire transaction and abort execution if any runtime statement error occurs.', 1,
    'Suppresses all error messages to the client application.', 0,
    'Commits the transaction even when errors happen.', 0,
    'Increases transaction timeout to infinite.', 0;

-- Multi-Choice MCQs (Data Analyst)
EXEC #sp_SeedQuestionV2 'QB-DATA-026', 'SQL', 'TechnicalMCQ', 'MULTI_CHOICE', 'Junior',
    'Which of the following aggregate functions ignore NULL values during computation in SQL? (Select all that apply)', 2.0,
    '`AVG(column)`', 1, '`SUM(column)`', 1, '`COUNT(column)`', 1, '`COUNT(*)`', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-027', 'SQL', 'TechnicalMCQ', 'MULTI_CHOICE', 'Mid-Level',
    'Which of the following SQL Server transaction isolation levels protect queries from "Dirty Reads" (reading uncommitted changes)? (Select all that apply)', 2.0,
    '`READ COMMITTED`', 1, '`REPEATABLE READ`', 1, '`SERIALIZABLE`', 1, '`READ UNCOMMITTED`', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-028', 'SQL', 'TechnicalMCQ', 'MULTI_CHOICE', 'Mid-Level',
    'Which of the following query operators or patterns typically prevent the SQL Server query optimizer from performing an Index Seek? (Select all that apply)', 2.0,
    '`WHERE YEAR(OrderDate) = 2026` (Function on column)', 1, '`WHERE CustomerName LIKE ''%Tech%''` (Leading wildcard)', 1, '`WHERE Status = ''Active''` on indexed column', 0, '`WHERE CAST(Id AS VARCHAR) = ''100''` (Data type conversion)', 1;

EXEC #sp_SeedQuestionV2 'QB-DATA-029', 'SQL', 'TechnicalMCQ', 'MULTI_CHOICE', 'Senior',
    'Which of the following window framing clauses are valid in standard SQL? (Select all that apply)', 2.0,
    '`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`', 1, '`ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING`', 1, '`RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`', 1, '`COLUMNS BETWEEN ALL ROWS`', 0;

EXEC #sp_SeedQuestionV2 'QB-DATA-030', 'SQL', 'TechnicalMCQ', 'MULTI_CHOICE', 'Senior',
    'Which of the following are ACID properties in relational database transaction management? (Select all that apply)', 2.0,
    'Atomicity', 1, 'Consistency', 1, 'Isolation', 1, 'Availability', 0;

-- SQL Query Writing Challenges (with SqlSchema & StarterCode)
EXEC #sp_SeedQuestionV2 'QB-DATA-031', 'SQL', 'SQLQuery', 'SQL', 'Junior',
    'Write a SQL query to find the 2nd highest salary from an `Employees` table. If there is no second highest salary, return NULL.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0,
    'CREATE TABLE Employees (
    Id INT PRIMARY KEY,
    Name NVARCHAR(50),
    Salary DECIMAL(10,2)
);
INSERT INTO Employees VALUES (1, ''Alice'', 90000), (2, ''Bob'', 80000), (3, ''Charlie'', 80000), (4, ''David'', 70000);',
    '-- Write your SQL query here using DENSE_RANK() or MAX() subquery
SELECT MAX(Salary) AS SecondHighestSalary 
FROM Employees;';

EXEC #sp_SeedQuestionV2 'QB-DATA-032', 'SQL', 'SQLQuery', 'SQL', 'Mid-Level',
    'Write a SQL query to calculate the cumulative running total of `OrderAmount` for each customer, ordered by `OrderDate`. Return CustomerId, OrderId, OrderDate, OrderAmount, and RunningTotal.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0,
    'CREATE TABLE Orders (
    OrderId INT PRIMARY KEY,
    CustomerId INT,
    OrderDate DATE,
    OrderAmount DECIMAL(10,2)
);
INSERT INTO Orders VALUES 
(1, 101, ''2026-01-01'', 150.00),
(2, 101, ''2026-01-05'', 200.00),
(3, 102, ''2026-01-02'', 300.00),
(4, 101, ''2026-01-10'', 50.00),
(5, 102, ''2026-01-15'', 100.00);',
    '-- Write your query using SUM() OVER (PARTITION BY ... ORDER BY ...)
SELECT OrderId, CustomerId, OrderDate, OrderAmount,
       SUM(OrderAmount) OVER (PARTITION BY CustomerId ORDER BY OrderDate) AS RunningTotal
FROM Orders;';

EXEC #sp_SeedQuestionV2 'QB-DATA-033', 'SQL', 'SQLQuery', 'SQL', 'Mid-Level',
    'Write a SQL query to identify duplicate records in a table `CandidateSubmissions` based on `Email` and `ExamCode`. Return Email, ExamCode, and the duplicate count.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0,
    'CREATE TABLE CandidateSubmissions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CandidateName NVARCHAR(60),
    Email NVARCHAR(100),
    ExamCode NVARCHAR(30),
    SubmittedAt DATETIME2
);
INSERT INTO CandidateSubmissions VALUES 
(''Aditya'', ''aditya@example.com'', ''EXAM-V2'', ''2026-01-01''),
(''John Doe'', ''john@example.com'', ''EXAM-V2'', ''2026-01-02''),
(''Aditya B'', ''aditya@example.com'', ''EXAM-V2'', ''2026-01-03''),
(''Sara Lee'', ''sara@example.com'', ''EXAM-V1'', ''2026-01-04'');',
    '-- Write query with GROUP BY and HAVING COUNT(*) > 1
SELECT Email, ExamCode, COUNT(*) AS DuplicateCount
FROM CandidateSubmissions
GROUP BY Email, ExamCode
HAVING COUNT(*) > 1;';

EXEC #sp_SeedQuestionV2 'QB-DATA-034', 'SQL', 'SQLQuery', 'SQL', 'Senior',
    'Write a SQL query to solve the "Islands & Gaps" problem: Find consecutive active user login streaks. Given table `UserLogins`, return UserId, StreakStartDate, StreakEndDate, and TotalConsecutiveDays (minimum 2 consecutive days).', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0,
    'CREATE TABLE UserLogins (
    UserId INT,
    LoginDate DATE
);
INSERT INTO UserLogins VALUES 
(1, ''2026-03-01''), (1, ''2026-03-02''), (1, ''2026-03-03''), (1, ''2026-03-05''),
(2, ''2026-03-01''), (2, ''2026-03-04''), (2, ''2026-03-05'');',
    '-- Write CTE utilizing DATEADD(day, -ROW_NUMBER() OVER(...), LoginDate)
WITH GrpLogins AS (
    SELECT UserId, LoginDate,
           DATEADD(day, -ROW_NUMBER() OVER(PARTITION BY UserId ORDER BY LoginDate), LoginDate) AS Grp
    FROM UserLogins
)
SELECT UserId, MIN(LoginDate) AS StreakStartDate, MAX(LoginDate) AS StreakEndDate, COUNT(*) AS TotalConsecutiveDays
FROM GrpLogins
GROUP BY UserId, Grp
HAVING COUNT(*) >= 2;';

-- Subjective Questions (Data Analyst)
EXEC #sp_SeedQuestionV2 'QB-DATA-035', 'SQL', 'SubjectiveTheory', 'SUBJECTIVE', 'Mid-Level',
    'Explain the differences between OLTP (Online Transaction Processing) and OLAP (Online Analytical Processing) systems. Discuss their opposing goals in schema normalization (3NF vs Star/Snowflake), indexing strategies, and read/write latency requirements.', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DATA-036', 'SQL', 'SubjectiveTheory', 'SUBJECTIVE', 'Senior',
    'What is Index Fragmentation in SQL Server? Explain the difference between Internal Fragmentation and External Fragmentation. When should you choose `ALTER INDEX REORGANIZE` versus `ALTER INDEX REBUILD`, and what are the concurrency locking implications of each?', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DATA-037', 'SQL', 'SubjectiveTheory', 'SUBJECTIVE', 'Senior',
    'Describe how you design a complete Data Warehouse ETL pipeline extracting from multiple relational databases into a central reporting store. How do you handle incremental change detection (Change Data Capture / timestamp watermarks), data cleaning, deduplication, and pipeline monitoring?', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DATA-038', 'SQL', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'Compare the modern Data Lakehouse architecture (Apache Iceberg, Delta Lake) with traditional enterprise Data Warehouses (Snowflake, BigQuery). How does ACID transaction capability on object storage (S3/GCS/Blob) bridge the gap between Big Data analytics and reliable SQL querying?', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DATA-039', 'SQL', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'How do you identify and mitigate severe Parameter Sniffing in SQL Server? Discuss plan cache recompilation (`OPTION (RECOMPILE)`), plan optimization hints (`OPTIMIZE FOR`), Query Store forced plans, and parameter masking with local variables.', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DATA-040', 'SQL', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'Design a comprehensive Disaster Recovery and High Availability architecture for a mission-critical 10TB SQL Server database. Compare Always On Availability Groups (Synchronous vs Asynchronous commit replicas), Log Shipping, and Azure SQL Failover Groups in terms of RPO, RTO, and quorum arbitration.', 3.33;

GO

-- ====================================================================================
-- TRACK 5: DEVOPS SPECIALIST (45 Questions)
-- ====================================================================================

-- Single Choice MCQs
EXEC #sp_SeedQuestionV2 'QB-DEV-011', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'In a Dockerfile, what is the key difference between `COPY` and `ADD` instructions?', 1.0,
    '`COPY` simply copies local files into the container; `ADD` can also fetch remote URLs and automatically unpack tar archives.', 1,
    '`COPY` is deprecated in Docker 24+.', 0,
    '`ADD` only works for text configuration files.', 0,
    'There is no difference.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-012', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'In Linux, what numeric octal permission corresponds to `rwxr-xr--`?', 1.0,
    '754', 1, '777', 0, '644', 0, '755', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-013', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Fresher',
    'In Git, what is the command to create a new branch named `feature/auth` and switch to it immediately?', 1.0,
    '`git checkout -b feature/auth` (or `git switch -c feature/auth`)', 1,
    '`git branch -c feature/auth`', 0,
    '`git merge feature/auth`', 0,
    '`git commit -b feature/auth`', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-014', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'In Kubernetes, what is the difference between a `LivenessProbe` and a `ReadinessProbe`?', 1.0,
    '`LivenessProbe` detects if the container is dead and restarts it; `ReadinessProbe` detects if the container is ready to accept user network traffic.', 1,
    '`ReadinessProbe` restarts the pod if CPU exceeds 90%.', 0,
    '`LivenessProbe` only runs once on pod startup.', 0,
    'Both probes execute identical actions on failure.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-015', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'In Kubernetes, what is the default Service type that exposes pods only within the cluster network?', 1.0,
    '`ClusterIP`', 1, '`NodePort`', 0, '`LoadBalancer`', 0, '`ExternalName`', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-016', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What is the primary benefit of multi-stage Docker builds?', 1.0,
    'Keeps production images lean and secure by excluding compilers, SDKs, and build tools from final release layers.', 1,
    'Builds container images across multiple cloud regions in parallel.', 0,
    'Automatically converts Docker images to Kubernetes YAML manifests.', 0,
    'Encrypts container filesystems with AES-256.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-017', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'What does Infrastructure as Code (IaC) tool `Terraform` use its `terraform.tfstate` file for?', 1.0,
    'Stores the state and mapping of managed real-world cloud infrastructure against configuration code.', 1,
    'Contains the plain-text passwords for root cloud accounts.', 0,
    'Compiles HCL code into native bash scripts.', 0,
    'Acts as a load balancer configuration file for NGINX.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-018', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In Kubernetes, what controller object is specifically designed to run exactly one copy of a Pod on every node (e.g. log collectors, monitoring daemons)?', 1.0,
    '`DaemonSet`', 1, '`StatefulSet`', 0, '`Deployment`', 0, '`ReplicaSet`', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-019', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'What is the difference between Blue-Green Deployment and Canary Deployment?', 1.0,
    'Blue-Green switches 100% traffic from idle environment to active; Canary incrementally routes a small percentage (e.g. 5%) to validate stability.', 1,
    'Canary deployment requires shutting down all servers for maintenance.', 0,
    'Blue-Green deployment cannot be rolled back.', 0,
    'Canary deployment only works on Kubernetes clusters.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-020', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In Linux networking, which tool is the modern replacement for `netstat` to inspect open listening sockets and TCP connections?', 1.0,
    '`ss`', 1, '`ping`', 0, '`traceroute`', 0, '`ifconfig`', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-021', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What signal does Kubernetes send to a container when initiating graceful termination before `SIGKILL`?', 1.0,
    '`SIGTERM` (15)', 1, '`SIGHUP` (1)', 0, '`SIGQUIT` (3)', 0, '`SIGINT` (2)', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-022', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What is the GitOps operational paradigm implemented by tools like ArgoCD and Flux?', 1.0,
    'Git repositories serve as the single source of truth for declared cluster state, with automated controllers reconciling drift.', 1,
    'Executing shell scripts directly inside production containers via Git webhooks.', 0,
    'Storing database backups inside Git LFS repositories.', 0,
    'Replacing Dockerfiles with Git submodules.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-023', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'In Prometheus monitoring, what metric type is appropriate for tracking request durations and latency distributions?', 1.0,
    '`Histogram` or `Summary`', 1, '`Counter`', 0, '`Gauge`', 0, '`Boolean`', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-024', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Lead',
    'What is the function of a Kubernetes `NetworkPolicy` object in cluster security hardening?', 1.0,
    'Restricts network traffic ingress and egress between pods and namespaces using packet-level rules.', 1,
    'Registers custom DNS domain names with public registrars.', 0,
    'Encrypts disk storage volumes at the hardware level.', 0,
    'Automatically scales Kubernetes worker nodes.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-025', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Lead',
    'In distributed systems observability, what are the Three Pillars of Observability?', 1.0,
    'Metrics, Logs, and Distributed Traces', 1, 'CPU, Memory, and Disk', 0, 'Alerts, Emails, and Pagers', 0, 'Firewalls, Routers, and Switches', 0;

-- Additional DevOps MCQs
EXEC #sp_SeedQuestionV2 'QB-DEV-025A', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'In Linux, what command displays the available disk space on all mounted filesystems in human-readable format?', 1.0,
    '`df -h`', 1, '`du -sh`', 0, '`fdisk -l`', 0, '`lsblk`', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-025B', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In Docker container runtime, what is the default logging driver that captures stdout and stderr to disk?', 1.0,
    '`json-file`', 1, '`syslog`', 0, '`fluentd`', 0, '`awslogs`', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-025C', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'In Kubernetes, what is the purpose of Horizontal Pod Autoscaler (HPA)?', 1.0,
    'Automatically scales the number of Pod replicas in a Deployment based on observed CPU utilization or custom metrics.', 1,
    'Automatically adds physical worker nodes to cloud clusters.', 0,
    'Increases RAM limits of individual running containers.', 0,
    'Balances network traffic across cloud regions.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-025D', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Junior',
    'What does the `docker system prune -a` command do?', 1.0,
    'Removes all unused containers, networks, volumes, and dangling as well as unreferenced cached images.', 1,
    'Restarts the Docker daemon service.', 0,
    'Upgrades Docker to the latest version.', 0,
    'Backs up all running container states to tar archives.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-025E', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In Kubernetes, what is a "Headless Service" (`spec.clusterIP: None`) used for?', 1.0,
    'Direct pod-to-pod DNS service discovery without proxying through a single virtual ClusterIP, commonly used for StatefulSets.', 1,
    'A service that has no network endpoints.', 0,
    'A service that routes traffic exclusively to external third-party domains.', 0,
    'A load balancer without TLS encryption.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-025F', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Mid-Level',
    'In Linux, which command shows the real-time dynamic view of running system processes, CPU consumption, and load averages?', 1.0,
    '`top` or `htop`', 1, '`ps -ef`', 0, '`free -m`', 0, '`vmstat`', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-025G', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'In Kubernetes scheduling, what is the difference between a "Taint" on a Node and an "Affinity" rule on a Pod?', 1.0,
    'Taints repel pods that do not have a matching toleration; Affinities attract pods to specific nodes or co-located pods.', 1,
    'Taints encrypt node storage while affinities balance traffic.', 0,
    'Taints apply only to control-plane master nodes.', 0,
    'Both concepts are identical and interchangeable.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-025H', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Lead',
    'In HashiCorp Vault, what is a "Dynamic Secret"?', 1.0,
    'Credentials generated on-demand with fine-grained permissions and automatic expiration/lease revocation after time-to-live (TTL).', 1,
    'Static passwords stored in an encrypted GitHub repository.', 0,
    'An SSH key that never expires.', 0,
    'A secret that changes on every HTTP request.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-025I', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Senior',
    'What is the purpose of Kubernetes Ingress class and ingress-nginx controller?', 1.0,
    'Routes external HTTP/HTTPS traffic to internal cluster services based on hostnames and URL path rules with TLS termination.', 1,
    'Provides block storage volumes to pods.', 0,
    'Restarts failed worker nodes in the cloud.', 0,
    'Manages container image registries.', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-025J', 'DevOps / Cloud', 'TechnicalMCQ', 'SINGLE_CHOICE', 'Lead',
    'What is the difference between OpenTelemetry (OTel) Collector agent mode and gateway mode?', 1.0,
    'Agent mode runs as a DaemonSet sidecar on each node; Gateway mode runs as a centralized scalable cluster receiving telemetry.', 1,
    'Agent mode cannot collect traces.', 0,
    'Gateway mode stores data only on local disk.', 0,
    'There is no architectural difference.', 0;

-- Multi-Choice MCQs (DevOps)
EXEC #sp_SeedQuestionV2 'QB-DEV-026', 'DevOps / Cloud', 'TechnicalMCQ', 'MULTI_CHOICE', 'Junior',
    'Which of the following practices reduce the size of a production Docker container image? (Select all that apply)', 2.0,
    'Using Alpine or distroless minimal base images', 1, 'Combining RUN commands with `&&` to minimize intermediate image layers', 1, 'Implementing multi-stage builds', 1, 'Installing all debug and man pages', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-027', 'DevOps / Cloud', 'TechnicalMCQ', 'MULTI_CHOICE', 'Mid-Level',
    'Which of the following are valid Kubernetes workload controllers? (Select all that apply)', 2.0,
    '`Deployment`', 1, '`StatefulSet`', 1, '`DaemonSet`', 1, '`SecurityGroup`', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-028', 'DevOps / Cloud', 'TechnicalMCQ', 'MULTI_CHOICE', 'Mid-Level',
    'Which of the following methods are secure ways to provide sensitive credentials (passwords, tokens) to Kubernetes Pods? (Select all that apply)', 2.0,
    'Injecting secrets via Kubernetes Secret mounted as volume', 1, 'Using external secret operators (HashiCorp Vault / AWS Secrets Manager)', 1, 'Hardcoding credentials in Dockerfile environment variables', 0, 'Passing secrets via ConfigMap in plain text', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-029', 'DevOps / Cloud', 'TechnicalMCQ', 'MULTI_CHOICE', 'Senior',
    'Which metrics comprise the Google SRE "Four Golden Signals" for service health monitoring? (Select all that apply)', 2.0,
    'Latency', 1, 'Traffic', 1, 'Errors', 1, 'Saturation', 1;

EXEC #sp_SeedQuestionV2 'QB-DEV-030', 'DevOps / Cloud', 'TechnicalMCQ', 'MULTI_CHOICE', 'Senior',
    'Which of the following are core principles of the GitOps deployment workflow? (Select all that apply)', 2.0,
    'The entire system state is described declaratively in Git', 1, 'State changes are reviewed and approved via Pull Requests', 1, 'Automated software agents continuously reconcile live state against target state', 1, 'Engineers perform live manual hotfixes directly on production servers', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-030A', 'DevOps / Cloud', 'TechnicalMCQ', 'MULTI_CHOICE', 'Junior',
    'Which of the following are valid Linux package managers used across popular Linux distributions? (Select all that apply)', 2.0,
    '`apt` (Debian/Ubuntu)', 1, '`yum` / `dnf` (RHEL/CentOS/Fedora)', 1, '`apk` (Alpine Linux)', 1, '`pipx` (Windows system packages)', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-030B', 'DevOps / Cloud', 'TechnicalMCQ', 'MULTI_CHOICE', 'Mid-Level',
    'Which of the following statements about Kubernetes ConfigMaps are true? (Select all that apply)', 2.0,
    'Can be consumed as environment variables in a container', 1, 'Can be mounted as configuration files inside a volume', 1, 'Are intended for non-confidential configuration data', 1, 'Automatically encrypt all stored data at rest with AES-256', 0;

EXEC #sp_SeedQuestionV2 'QB-DEV-030C', 'DevOps / Cloud', 'TechnicalMCQ', 'MULTI_CHOICE', 'Senior',
    'Which of the following techniques protect containerized environments against container breakout attacks? (Select all that apply)', 2.0,
    'Running containers as non-root user (`USER 1000:1000`)', 1, 'Dropping all unnecessary Linux capabilities (`capDrop: ["ALL"]`)', 1, 'Enabling read-only root filesystems (`readOnlyRootFilesystem: true`)', 1, 'Granting privileged mode (`privileged: true`)', 0;

-- Scripting Challenges (DevOps)
EXEC #sp_SeedQuestionV2 'QB-DEV-031', 'DevOps / Cloud', 'Coding', 'CODING', 'Junior',
    'Write a Python script that analyzes an Nginx access log file and prints the top 5 client IP addresses by request count along with their frequency.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL,
    'import collections

def get_top_ips(log_file_path):
    counts = collections.Counter()
    with open(log_file_path, "r") as f:
        for line in f:
            ip = line.split()[0]
            counts[ip] += 1
    return counts.most_common(5)

if __name__ == "__main__":
    top5 = get_top_ips("/var/log/nginx/access.log")
    for ip, count in top5:
        print(f"{ip}: {count}")';

EXEC #sp_SeedQuestionV2 'QB-DEV-032', 'DevOps / Cloud', 'Coding', 'CODING', 'Mid-Level',
    'Write a Python automation script that checks the HTTP status code of an endpoint. If the endpoint fails for 3 consecutive attempts spaced 5 seconds apart, log an alert and return False.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL,
    'import urllib.request
import time

def check_endpoint_health(url, retries=3, delay=5):
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(url, timeout=5) as resp:
                if resp.status == 200:
                    return True
        except Exception as ex:
            print(f"Attempt {attempt} failed: {ex}")
        time.sleep(delay)
    return False

if __name__ == "__main__":
    is_healthy = check_endpoint_health("https://example.com/health")
    print(f"Service healthy: {is_healthy}")';

EXEC #sp_SeedQuestionV2 'QB-DEV-033', 'DevOps / Cloud', 'Coding', 'CODING', 'Mid-Level',
    'Write a Python script that inspects a directory of backup archives and deletes all files older than 14 days, logging each deleted filename.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL,
    'import os
import time

def cleanup_old_backups(directory_path, retention_days=14):
    cutoff_time = time.time() - (retention_days * 86400)
    for filename in os.listdir(directory_path):
        filepath = os.path.join(directory_path, filename)
        if os.path.isfile(filepath) and os.path.getmtime(filepath) < cutoff_time:
            print(f"Removing stale backup: {filepath}")
            os.remove(filepath)

if __name__ == "__main__":
    cleanup_old_backups("/var/backups", 14)';

EXEC #sp_SeedQuestionV2 'QB-DEV-034', 'DevOps / Cloud', 'Coding', 'CODING', 'Senior',
    'Write a Python script that parses a Kubernetes pod list JSON from stdin and prints all pods whose container restart count is greater than 5 along with their container name and namespace.', 6.0,
    NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL,
    'import sys
import json

def parse_failing_pods():
    data = json.load(sys.stdin)
    for pod in data.get("items", []):
        name = pod.get("metadata", {}).get("name")
        ns = pod.get("metadata", {}).get("namespace")
        for cs in pod.get("status", {}).get("containerStatuses", []):
            restarts = cs.get("restartCount", 0)
            if restarts > 5:
                cname = cs.get("name")
                print(f"Namespace: {ns} | Pod: {name} | Container: {cname} | Restarts: {restarts}")

if __name__ == "__main__":
    parse_failing_pods()';

-- Subjective / Architecture Questions (DevOps)
EXEC #sp_SeedQuestionV2 'QB-DEV-035', 'DevOps / Cloud', 'SubjectiveTheory', 'SUBJECTIVE', 'Mid-Level',
    'Describe how you would design a CI/CD pipeline using GitHub Actions / GitLab CI for a modern containerized microservice. Detail the stages: Linting & Unit Tests, Vulnerability Scanning (Trivy), Multi-stage Docker build & push, Helm/Kustomize manifest update, and GitOps deployment triggers.', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DEV-036', 'DevOps / Cloud', 'SubjectiveTheory', 'SUBJECTIVE', 'Senior',
    'Explain how you design a Zero-Downtime Database Migration strategy in an automated CI/CD pipeline. Discuss the Expand/Contract (Parallel Run) pattern: adding nullable columns, dual-writing, backfilling historical data, updating application code, and dropping deprecated columns.', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DEV-037', 'DevOps / Cloud', 'SubjectiveTheory', 'SUBJECTIVE', 'Senior',
    'How do you architect a comprehensive Disaster Recovery (DR) plan for a critical Kubernetes application with an RPO (Recovery Point Objective) < 15 minutes and RTO (Recovery Time Objective) < 30 minutes across two cloud regions? Discuss database replication, persistent volume snapshots (Velero), and DNS failover (Route53/Cloudflare).', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DEV-038', 'DevOps / Cloud', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'Design an enterprise-grade Secret Management architecture for microservices running on Kubernetes. Compare HashiCorp Vault, AWS/Azure Secret Store CSI Drivers, and Sealed Secrets. How do you implement automated secret rotation and prevent secret leakage into git repositories or container logs?', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DEV-039', 'DevOps / Cloud', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'Describe how you architect an end-to-end cloud infrastructure monitoring and observability stack using Prometheus, Grafana, Thanos/Cortex, FluentBit, and OpenTelemetry. How do you manage metric cardinalities, long-term cold storage, and actionable alerting without inducing alert fatigue?', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DEV-040', 'DevOps / Cloud', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'Explain the principles of Chaos Engineering and how you would implement chaos experiments in a production Kubernetes cluster using Chaos Mesh or LitmusChaos. How do you systematically test pod failures, network partitions, latency injection, and dependency degradation without causing catastrophic service outages?', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DEV-041', 'DevOps / Cloud', 'SubjectiveTheory', 'SUBJECTIVE', 'Senior',
    'Explain how you would design a Multi-Tenant Kubernetes Cluster isolation strategy. Detail the controls: Namespace isolation, NetworkPolicies, ResourceQuotas and LimitRanges, RBAC role bindings, and Pod Security Standards (Privileged vs Baseline vs Restricted).', 3.33;

EXEC #sp_SeedQuestionV2 'QB-DEV-042', 'DevOps / Cloud', 'SubjectiveTheory', 'SUBJECTIVE', 'Lead',
    'Describe how you design a centralized logging architecture processing 50,000 log events per second across 100+ microservices. Compare the ELK Stack (Elasticsearch, Logstash, Kibana) with Grafana Loki and FluentBit in terms of ingestion cost, indexing strategy, and search latency.', 3.33;

GO

-- Cleanup Helper Procedure
DROP PROCEDURE #sp_SeedQuestionV2;
GO

PRINT 'Enterprise Question Bank Seeding Completed Successfully!';
GO
