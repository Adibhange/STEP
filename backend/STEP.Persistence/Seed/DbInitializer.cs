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

                // Ensure HR user
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
                }
                else
                {
                    hrUser.PasswordHash = hash;
                    hrUser.IsActive = true;
                    hrUser.IsDeleted = false;
                }

                // Ensure Admin user
                var adminUser = await db.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "admin@sthapatya.in");
                if (adminUser == null)
                {
                    db.Users.Add(new User
                    {
                        EmployeeCode = "EMP-0099",
                        FirstName = "System",
                        LastName = "Administrator",
                        Email = "admin@sthapatya.in",
                        PasswordHash = hash,
                        RoleId = 1, // Administrator Role
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                else
                {
                    adminUser.PasswordHash = hash;
                    adminUser.IsActive = true;
                    adminUser.IsDeleted = false;
                }

                // Ensure Director users have 4-digit PIN "1234"
                var directors = await db.Users.IgnoreQueryFilters().Where(u => u.RoleId == 2).ToListAsync();
                foreach (var dir in directors)
                {
                    dir.PinHash = pinHash;
                    dir.PasswordHash = hash;
                    dir.IsActive = true;
                    dir.IsDeleted = false;
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
