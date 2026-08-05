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

            // Ensure HR Role has User.Manage (7) and MasterData.Manage (8) permissions
            var syncPermissionsSql = @"
                IF NOT EXISTS (SELECT 1 FROM master.RolePermissions WHERE RoleId = 3 AND PermissionId = 7)
                    INSERT INTO master.RolePermissions (RoleId, PermissionId, CreatedAt, IsDeleted) VALUES (3, 7, GETUTCDATE(), 0);
                IF NOT EXISTS (SELECT 1 FROM master.RolePermissions WHERE RoleId = 3 AND PermissionId = 8)
                    INSERT INTO master.RolePermissions (RoleId, PermissionId, CreatedAt, IsDeleted) VALUES (3, 8, GETUTCDATE(), 0);
            ";
            await db.Database.ExecuteSqlRawAsync(syncPermissionsSql);
        }
    }
}
