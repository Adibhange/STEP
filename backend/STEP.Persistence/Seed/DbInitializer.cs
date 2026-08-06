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
        }
    }
}
