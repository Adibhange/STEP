using System;
using Microsoft.EntityFrameworkCore;
using STEP.Domain.Entities.Master;

namespace STEP.Persistence.Seed
{
    /// <summary>
    /// Seeds the master-data taxonomies with clean enterprise defaults.
    /// </summary>
    public static class MasterDataSeedData
    {
        private static readonly DateTime SeedTimestamp = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public static void Seed(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MasterRole>().HasData(
                Row<MasterRole>(1, ".NET Developer", "DOTNET", "C# .NET Enterprise Software Developer"),
                Row<MasterRole>(2, "Data Analyst", "DATA", "Data Analytics & Engineering"),
                Row<MasterRole>(3, "Software Engineer", "SE", "Full Stack Web Developer"),
                Row<MasterRole>(4, "DevOps Specialist", "DEVOPS", "Cloud Infrastructure & Automation")
            );

            modelBuilder.Entity<MasterDepartment>().HasData(
                Row<MasterDepartment>(1, "Production", "PROD", "Core Production Operations"),
                Row<MasterDepartment>(2, "AMC", "AMC", "Annual Maintenance Contracts"),
                Row<MasterDepartment>(3, "HR & IT", "HRIT", "Human Resources & Technology Services")
            );

            modelBuilder.Entity<MasterHiringLocation>().HasData(
                Row<MasterHiringLocation>(1, "Pune Office", "PUNE", "Pune Corporate HQ & Assessment Hub")
            );

            modelBuilder.Entity<MasterEmploymentType>().HasData(
                Row<MasterEmploymentType>(1, "Full-Time Permanent", "FT", "Standard employee contract"),
                Row<MasterEmploymentType>(2, "Contractual (6-12 Months)", "CON", "Fixed term contract"),
                Row<MasterEmploymentType>(3, "Graduate Internship", "INT", "6 Months stipend program")
            );

            modelBuilder.Entity<MasterExperienceLevel>().HasData(
                ExpLevelRow(1, "Fresher (0 Years)", "EXP-0", "No prior professional experience", 0.0m, 0.0m),
                ExpLevelRow(2, "Junior (0-1 Year)", "EXP-1", "Up to 1 year of experience", 0.0m, 1.0m),
                ExpLevelRow(3, "Mid-Level (1-3 Years)", "EXP-3", "1 to 3 years of experience", 1.0m, 3.0m),
                ExpLevelRow(4, "Senior (3-5 Years)", "EXP-5", "3 to 5 years of experience", 3.0m, 5.0m),
                ExpLevelRow(5, "Lead (5-8 Years)", "EXP-8", "5 to 8 years of experience", 5.0m, 8.0m),
                ExpLevelRow(6, "Principal (8+ Years)", "EXP-8P", "8 or more years of experience", 8.0m, 99.0m)
            );

            modelBuilder.Entity<RoleHiringProfile>().HasData(
                // Software Engineer Profiles
                ProfileRow(1, 3, "Fresher (0-1 Year)", 1, 0.0m, 1.0m, 65.00m, 450000m, true),
                ProfileRow(2, 3, "Junior (1-2 Years)", 2, 1.0m, 2.5m, 70.00m, 650000m, false),
                ProfileRow(3, 3, "Mid-Level (2-4 Years)", 3, 2.5m, 4.5m, 75.00m, 1100000m, false),
                ProfileRow(4, 3, "Senior (5+ Years)", 4, 5.0m, 10.0m, 80.00m, 1800000m, false),

                // .NET Developer Profiles
                ProfileRow(5, 1, "Fresher (.NET Core 10)", 1, 0.0m, 1.0m, 65.00m, 450000m, true),
                ProfileRow(6, 1, "Mid-Level C# Backend (2-4 Years)", 3, 2.0m, 4.0m, 75.00m, 1000000m, false),
                ProfileRow(7, 1, "Senior .NET Architect (5+ Years)", 4, 5.0m, 10.0m, 80.00m, 1750000m, false),

                // Data Analyst Profiles
                ProfileRow(8, 2, "Graduate Trainee Analyst", 1, 0.0m, 1.0m, 65.00m, 400000m, true),
                ProfileRow(9, 2, "Experienced Analytics (2-4 Years)", 3, 2.0m, 4.5m, 75.00m, 950000m, false),

                // DevOps Specialist Profiles
                ProfileRow(10, 4, "Junior Cloud Engineer (1-2 Years)", 2, 1.0m, 2.5m, 70.00m, 700000m, true),
                ProfileRow(11, 4, "Senior DevOps Architect (3-5 Years)", 4, 3.0m, 6.0m, 80.00m, 1600000m, false)
            );

            // Default Section Rules per Profile
            modelBuilder.Entity<RoleAssessmentSectionRule>().HasData(
                // Software Engineer (Fresher - Profile 1)
                SectionRuleRow(1, 1, "Aptitude & Logic Reasoning", "Aptitude", "SINGLE_CHOICE", "Easy", "Aptitude,Logical", 5, 1.0m, 10, null, 1),
                SectionRuleRow(2, 1, "Web & JavaScript Core MCQs", "TechnicalMCQ", "SINGLE_CHOICE", "Medium", "JavaScript,Web", 10, 1.0m, 15, "javascript", 2),
                SectionRuleRow(3, 1, "Basic Problem Solving Code", "Coding", "CODING", "Medium", "Algorithms,Basic", 1, 10.0m, 20, "javascript", 3),

                // .NET Developer (Fresher - Profile 5)
                SectionRuleRow(4, 5, "General Aptitude Screening", "Aptitude", "SINGLE_CHOICE", "Easy", "Aptitude,Math", 5, 1.0m, 10, null, 1),
                SectionRuleRow(5, 5, "C# & .NET Core Fundamentals", "TechnicalMCQ", "SINGLE_CHOICE", "Medium", "CSharp,DotNet", 10, 1.0m, 15, "csharp", 2),
                SectionRuleRow(6, 5, "SQL Relational Queries", "SQLQuery", "SQL", "Medium", "SQL,Joins", 2, 5.0m, 15, "sql", 3),
                SectionRuleRow(7, 5, "C# Practical Coding Task", "Coding", "CODING", "Medium", "CSharp,Algorithms", 1, 10.0m, 20, "csharp", 4)
            );

            // Central Question Bank Seed Items
            modelBuilder.Entity<MasterQuestion>().HasData(
                // Aptitude (General)
                QuestionRow(1, "QB-APT-01", "General Aptitude", "Aptitude", "SINGLE_CHOICE", "Fresher", "If a car travels 120 km in 2 hours, what is its average speed in m/s?", 1.0m),
                QuestionRow(2, "QB-APT-02", "General Aptitude", "Aptitude", "SINGLE_CHOICE", "Fresher", "Find the next number in the series: 3, 6, 12, 24, 48, ?", 1.0m),
                QuestionRow(3, "QB-APT-03", "General Aptitude", "Aptitude", "SINGLE_CHOICE", "Fresher", "A train 150m long passes a pole in 15 seconds. What is the speed of the train in km/h?", 1.0m),
                QuestionRow(4, "QB-APT-04", "General Aptitude", "Aptitude", "SINGLE_CHOICE", "Fresher", "What is 15% of 240 plus 25% of 160?", 1.0m),
                QuestionRow(5, "QB-APT-05", "General Aptitude", "Aptitude", "SINGLE_CHOICE", "Fresher", "Pointing to a photograph, a man says: 'He is the son of the only son of my grandfather.' How is he related?", 1.0m),

                // .NET / C# MCQs
                QuestionRow(6, "QB-DOT-01", "C# (.NET)", "TechnicalMCQ", "SINGLE_CHOICE", "Fresher", "What is the primary difference between a 'class' and a 'struct' in C#?", 1.0m),
                QuestionRow(7, "QB-DOT-02", "C# (.NET)", "TechnicalMCQ", "SINGLE_CHOICE", "Fresher", "Which keyword in C# is used to ensure unmanaged resources are deterministically disposed?", 1.0m),
                QuestionRow(8, "QB-DOT-03", "C# (.NET)", "TechnicalMCQ", "SINGLE_CHOICE", "Fresher", "What is the purpose of the 'async' and 'await' keywords in modern .NET?", 1.0m),
                QuestionRow(9, "QB-DOT-04", "C# (.NET)", "TechnicalMCQ", "SINGLE_CHOICE", "Fresher", "In ASP.NET Core Dependency Injection, which lifetime creates an instance per HTTP request?", 1.0m),
                QuestionRow(10, "QB-DOT-05", "C# (.NET)", "TechnicalMCQ", "SINGLE_CHOICE", "Fresher", "Which interface in C# allows an object to be enumerated using a foreach loop?", 1.0m),

                // SQL Queries
                QuestionRow(11, "QB-SQL-01", "SQL", "SQLQuery", "SQL", "Fresher", "Write an SQL query to find the 2nd highest salary from the Employee table.", 5.0m, "CREATE TABLE Employee (Id INT PRIMARY KEY, Name NVARCHAR(50), Salary DECIMAL(18,2));"),
                QuestionRow(12, "QB-SQL-02", "SQL", "SQLQuery", "SQL", "Fresher", "Write an SQL query to retrieve Department names along with the count of active employees.", 5.0m, "CREATE TABLE Department (Id INT, DeptName NVARCHAR(50)); CREATE TABLE Employee (Id INT, DeptId INT);"),

                // Coding Challenges
                QuestionRow(13, "QB-COD-01", "C# (.NET)", "Coding", "CODING", "Fresher", "Implement a function 'IsPalindrome(string s)' that returns true if a given string reads the same forwards and backwards, ignoring case.", 10.0m),
                QuestionRow(14, "QB-COD-02", "JavaScript / React", "Coding", "CODING", "Fresher", "Implement a function 'twoSum(nums, target)' that returns the indices of the two numbers that add up to the target.", 10.0m)
            );

            // Master Question Options
            modelBuilder.Entity<MasterQuestionOption>().HasData(
                // Q1
                OptionRow(1, 1, "A", "16.67 m/s", true, 1),
                OptionRow(2, 1, "B", "20.00 m/s", false, 2),
                OptionRow(3, 1, "C", "60.00 m/s", false, 3),
                OptionRow(4, 1, "D", "25.50 m/s", false, 4),

                // Q2
                OptionRow(5, 2, "A", "72", false, 1),
                OptionRow(6, 2, "B", "96", true, 2),
                OptionRow(7, 2, "C", "84", false, 3),
                OptionRow(8, 2, "D", "108", false, 4),

                // Q6
                OptionRow(9, 6, "A", "Class is reference type (heap); Struct is value type (stack)", true, 1),
                OptionRow(10, 6, "B", "Struct supports inheritance; Class does not", false, 2),
                OptionRow(11, 6, "C", "There is no difference in memory allocation", false, 3),
                OptionRow(12, 6, "D", "Class cannot have constructors", false, 4),

                // Q7
                OptionRow(13, 7, "A", "using", true, 1),
                OptionRow(14, 7, "B", "lock", false, 2),
                OptionRow(15, 7, "C", "fixed", false, 3),
                OptionRow(16, 7, "D", "checked", false, 4),

                // Q9
                OptionRow(17, 9, "A", "Transient", false, 1),
                OptionRow(18, 9, "B", "Scoped", true, 2),
                OptionRow(19, 9, "C", "Singleton", false, 3),
                OptionRow(20, 9, "D", "Static", false, 4)
            );
        }

        private static T Row<T>(int id, string name, string code, string description, bool isActive = true)
            where T : MasterDataEntity, new()
            => new()
            {
                Id = id,
                Name = name,
                Code = code,
                Description = description,
                IsActive = isActive,
                CreatedAt = SeedTimestamp
            };

        private static MasterExperienceLevel ExpLevelRow(int id, string name, string code, string description, decimal minYears, decimal maxYears, bool isActive = true)
            => new()
            {
                Id = id,
                Name = name,
                Code = code,
                Description = description,
                MinYears = minYears,
                MaxYears = maxYears,
                IsActive = isActive,
                CreatedAt = SeedTimestamp
            };

        private static RoleHiringProfile ProfileRow(
            int id, int roleId, string name, int expLevelId, decimal minExp, decimal maxExp, decimal cutoff, decimal baseCtc, bool isDefault)
            => new()
            {
                Id = id,
                MasterRoleId = roleId,
                ProfileName = name,
                ExperienceLevelId = expLevelId,
                MinExperienceYears = minExp,
                MaxExperienceYears = maxExp,
                PassingPercentage = cutoff,
                DefaultBaseCTC = baseCtc,
                AutoAdvanceOnPass = true,
                AutoRejectOnFail = true,
                AutoPrepareOfferOnFinalPass = true,
                IsDefault = isDefault,
                IsActive = true,
                CreatedAt = SeedTimestamp
            };

        private static RoleAssessmentSectionRule SectionRuleRow(
            int id, int profileId, string name, string sectionType, string qType, string diff, string tags, int count, decimal marks, int? timeMin, string? lang, int order)
            => new()
            {
                Id = id,
                RoleHiringProfileId = profileId,
                SectionName = name,
                SectionType = sectionType,
                QuestionType = qType,
                Difficulty = diff,
                RequiredTags = tags,
                QuestionCount = count,
                MarksPerQuestion = marks,
                TimeLimitMinutes = timeMin,
                ProgrammingLanguage = lang,
                SelectionStrategy = "RandomShuffled",
                DisplayOrder = order,
                IsActive = true,
                CreatedAt = SeedTimestamp
            };

        private static MasterQuestion QuestionRow(
            int id, string code, string lang, string sectionType, string qType, string exp, string text, decimal marks, string? schema = null)
            => new()
            {
                Id = id,
                Code = code,
                Language = lang,
                SectionType = sectionType,
                QuestionType = qType,
                ExperienceTier = exp,
                QuestionText = text,
                Marks = marks,
                SqlSchema = schema,
                IsActive = true,
                CreatedAt = SeedTimestamp
            };

        private static MasterQuestionOption OptionRow(
            int id, int questionId, string label, string text, bool isCorrect, int order)
            => new()
            {
                Id = id,
                MasterQuestionId = questionId,
                OptionLabel = label,
                OptionText = text,
                IsCorrect = isCorrect,
                DisplayOrder = order,
                CreatedAt = SeedTimestamp
            };
    }
}
