using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using STEP.Domain.Entities.Identity;

namespace STEP.Persistence.Seed
{
    public static class DbInitializer
    {
        public static async Task EnsureUserPasswordAsync(ApplicationDbContext db)
        {
            try
            {
                var hash = BCrypt.Net.BCrypt.HashPassword("user@123");
                var pinHash = BCrypt.Net.BCrypt.HashPassword("1234"); // 4-digit Director PIN

                // Ensure Prerana Nehere (HR)
                var hrUser = await db.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "prerananehere29@gmail.com");
                if (hrUser != null)
                {
                    hrUser.PasswordHash = hash;
                    hrUser.RoleId = 3;
                    hrUser.DepartmentId = 5;
                    hrUser.IsActive = true;
                    hrUser.IsDeleted = false;
                }

                // Ensure Prashant Doifode (Director)
                var dirUser = await db.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "prashant.df@sthapatya.in");
                if (dirUser != null)
                {
                    dirUser.PinHash = pinHash;
                    dirUser.PasswordHash = hash;
                    dirUser.RoleId = 2;
                    dirUser.DepartmentId = 6;
                    dirUser.IsActive = true;
                    dirUser.IsDeleted = false;
                }

                // Ensure Aditya Bhange (Interviewer)
                var interviewerUser = await db.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "ab@sthapatya.com");
                if (interviewerUser != null)
                {
                    interviewerUser.PasswordHash = hash;
                    interviewerUser.RoleId = 4;
                    interviewerUser.DepartmentId = 6;
                    interviewerUser.IsActive = true;
                    interviewerUser.IsDeleted = false;
                }

                await db.SaveChangesAsync();

                var syncPermissionsSql = @"
                    INSERT INTO master.RolePermissions (RoleId, PermissionId, CreatedAt, IsDeleted)
                    SELECT r.RoleId, p.PermissionId, GETUTCDATE(), 0
                    FROM (VALUES (1), (2), (3)) AS r(RoleId)
                    CROSS JOIN (VALUES (1), (2), (3), (4), (5), (6), (7), (8)) AS p(PermissionId)
                    WHERE NOT EXISTS (
                        SELECT 1 FROM master.RolePermissions rp
                        WHERE rp.RoleId = r.RoleId AND rp.PermissionId = p.PermissionId
                    );
                ";
                await db.Database.ExecuteSqlRawAsync(syncPermissionsSql);

                var syncInterviewerPermissionsSql = @"
                    INSERT INTO master.RolePermissions (RoleId, PermissionId, CreatedAt, IsDeleted)
                    SELECT r.RoleId, p.PermissionId, GETUTCDATE(), 0
                    FROM (VALUES (4)) AS r(RoleId)
                    CROSS JOIN (VALUES (3), (5)) AS p(PermissionId)
                    WHERE NOT EXISTS (
                        SELECT 1 FROM master.RolePermissions rp
                        WHERE rp.RoleId = r.RoleId AND rp.PermissionId = p.PermissionId
                    );
                ";
                await db.Database.ExecuteSqlRawAsync(syncInterviewerPermissionsSql);

                var addMissingColumnsSql = @"
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'candidate.CandidatePipelineProgress') AND name = N'ScheduledTestDate')
                    BEGIN
                        ALTER TABLE candidate.CandidatePipelineProgress ADD ScheduledTestDate DATETIME2 NULL;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'candidate.CandidatePipelineProgress') AND name = N'ScheduledStartTimeUtc')
                    BEGIN
                        ALTER TABLE candidate.CandidatePipelineProgress ADD ScheduledStartTimeUtc DATETIME2 NULL;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'candidate.CandidatePipelineProgress') AND name = N'ScheduledEndTimeUtc')
                    BEGIN
                        ALTER TABLE candidate.CandidatePipelineProgress ADD ScheduledEndTimeUtc DATETIME2 NULL;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'candidate.CandidatePipelineProgress') AND name = N'AssessmentMode')
                    BEGIN
                        ALTER TABLE candidate.CandidatePipelineProgress ADD AssessmentMode NVARCHAR(50) NULL;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'candidate.CandidatePipelineProgress') AND name = N'TestPasscode')
                    BEGIN
                        ALTER TABLE candidate.CandidatePipelineProgress ADD TestPasscode NVARCHAR(20) NULL;
                    END
                ";
                await db.Database.ExecuteSqlRawAsync(addMissingColumnsSql);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DbInitializer] Error initializing database seed/schema: {ex.Message}");
            }
        }
    }
}
