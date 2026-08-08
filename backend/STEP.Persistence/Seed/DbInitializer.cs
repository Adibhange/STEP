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
                var hrUser = await db.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "hr@sthapatya.com");

                if (hrUser == null)
                {
                    db.Users.Add(new User
                    {
                        EmployeeCode = "EMP-0001",
                        FirstName = "HR",
                        LastName = "Specialist",
                        Email = "hr@sthapatya.com",
                        PasswordHash = hash,
                        RoleId = 3, // HR Role
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                    await db.SaveChangesAsync();
                }
                else
                {
                    hrUser.PasswordHash = hash;
                    hrUser.IsActive = true;
                    hrUser.IsDeleted = false;
                    await db.SaveChangesAsync();
                }

                // Ensure Director (RoleId = 2) has a valid PIN hash for PIN "123456"
                var pinHash = BCrypt.Net.BCrypt.HashPassword("123456");
                var directorUser = await db.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.RoleId == 2 || u.Email == "director@sthapatya.com");

                if (directorUser == null)
                {
                    db.Users.Add(new User
                    {
                        EmployeeCode = "EMP-0002",
                        FirstName = "Director",
                        LastName = "Executive",
                        Email = "director@sthapatya.com",
                        PasswordHash = hash,
                        PinHash = pinHash,
                        RoleId = 2, // Director Role
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                    await db.SaveChangesAsync();
                }
                else if (string.IsNullOrEmpty(directorUser.PinHash))
                {
                    directorUser.PinHash = pinHash;
                    await db.SaveChangesAsync();
                }

                var syncPermissionsSql = @"
                    INSERT INTO master.RolePermissions (RoleId, PermissionId, CreatedAt, IsDeleted)
                    SELECT r.RoleId, p.PermissionId, GETUTCDATE(), 0
                    FROM (VALUES (2), (3)) AS r(RoleId)
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
