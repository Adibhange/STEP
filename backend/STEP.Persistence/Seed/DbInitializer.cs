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

            // Ensure Director (RoleId=2) and HR (RoleId=3) carry every permission (1-8), matching
            // IdentitySeedData's AddGrants(RoleDirectorId)/AddGrants(RoleHRId) with no filter —
            // both need the full vacancy-to-exam lifecycle (create vacancy, build assessment
            // pattern, import/publish question papers) without handing off to another role
            // mid-flow. This runtime sync exists because a prior narrower patch here only granted
            // permissions 7 and 8 to HR, silently leaving HR (and Director) unable to create
            // vacancies or manage exams despite IdentitySeedData's declared intent.
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

            // Same drift, same fix, for Interviewer (RoleId=4) — this DB's RolePermissions table
            // never actually had IdentitySeedData's AddGrants(RoleInterviewerId, "Candidate.View",
            // "Exam.Manage") applied (discovered when a real Interviewer login came back with
            // zero permissions). Deliberately narrower than Director/HR — interviewers only need
            // to view their assigned candidates and access the exam/interview scoring surface.
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

            // Auto-Add new columns to CandidatePipelineProgress if missing in existing database
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
                ELSE
                BEGIN
                    ALTER TABLE candidate.CandidatePipelineProgress ALTER COLUMN AssessmentMode NVARCHAR(50) NULL;
                END

                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'candidate.CandidatePipelineProgress') AND name = N'TestPasscode')
                BEGIN
                    ALTER TABLE candidate.CandidatePipelineProgress ADD TestPasscode NVARCHAR(20) NULL;
                END
                ELSE
                BEGIN
                    ALTER TABLE candidate.CandidatePipelineProgress ALTER COLUMN TestPasscode NVARCHAR(20) NULL;
                END
            ";
            await db.Database.ExecuteSqlRawAsync(addMissingColumnsSql);
        }
    }
}
