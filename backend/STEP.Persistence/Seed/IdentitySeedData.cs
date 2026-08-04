using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using STEP.Domain.Entities.Identity;

namespace STEP.Persistence.Seed
{
    /// <summary>
    /// Deterministic Phase 1 seed data: RBAC roles, permissions, role-permission grants,
    /// and two bootstrap users so the login flow is testable end-to-end from a fresh database.
    ///
    /// Seed credentials (DEVELOPMENT ONLY — rotate before any real production use):
    ///   admin@sthapatya.in    / ChangeMe@2026   (Role: Administrator)
    ///   director@sthapatya.in / ChangeMe@2026   (Role: Director, PIN: 123456)
    /// </summary>
    public static class IdentitySeedData
    {
        private static readonly DateTime SeedTimestamp = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public const int RoleAdministratorId = 1;
        public const int RoleDirectorId = 2;
        public const int RoleHRId = 3;
        public const int RoleInterviewerId = 4;

        private static readonly (int Id, string Module, string Action)[] PermissionSeed =
        {
            (1, "Vacancy", "View"),
            (2, "Vacancy", "Create"),
            (3, "Candidate", "View"),
            (4, "Candidate", "Approve"),
            (5, "Exam", "Manage"),
            (6, "Report", "View"),
            (7, "User", "Manage"),
            (8, "MasterData", "Manage"),
        };

        public static void Seed(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = RoleAdministratorId, Name = "Administrator", Description = "Full system access", IsSystemRole = true, CreatedAt = SeedTimestamp },
                new Role { Id = RoleDirectorId, Name = "Director", Description = "High-privilege approvals via PIN", IsSystemRole = true, CreatedAt = SeedTimestamp },
                new Role { Id = RoleHRId, Name = "HR", Description = "Recruitment operations", IsSystemRole = true, CreatedAt = SeedTimestamp },
                new Role { Id = RoleInterviewerId, Name = "Interviewer", Description = "Interview panel member", IsSystemRole = true, CreatedAt = SeedTimestamp }
            );

            modelBuilder.Entity<Permission>().HasData(
                Array.ConvertAll(PermissionSeed, p => new Permission
                {
                    Id = p.Id,
                    Module = p.Module,
                    Action = p.Action,
                    Code = $"{p.Module}.{p.Action}",
                    CreatedAt = SeedTimestamp
                })
            );

            var grantId = 0;
            RolePermission[] Grants(int roleId, params string[] onlyCodes) => BuildGrants(roleId, PermissionSeed, ref grantId, onlyCodes);

            modelBuilder.Entity<RolePermission>().HasData(
                Grants(RoleAdministratorId) // Administrator: everything
                .Concat(Grants(RoleDirectorId)) // Director: everything (approval authority)
                .Concat(Grants(RoleHRId, "Vacancy.View", "Vacancy.Create", "Candidate.View", "Candidate.Approve", "Report.View"))
                .Concat(Grants(RoleInterviewerId, "Candidate.View", "Exam.Manage"))
            );

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    EmployeeCode = "EMP-0001",
                    FirstName = "System",
                    LastName = "Administrator",
                    Email = "admin@sthapatya.in",
                    PasswordHash = "$2a$11$s0pq2G6y4vyN5Z8EzMTFJuJZ64133EjeIW8knPKKM4CReDLR8RH4W", // ChangeMe@2026
                    RoleId = RoleAdministratorId,
                    IsActive = true,
                    CreatedAt = SeedTimestamp
                },
                new User
                {
                    Id = 2,
                    EmployeeCode = "EMP-0002",
                    FirstName = "Founding",
                    LastName = "Director",
                    Email = "director@sthapatya.in",
                    PasswordHash = "$2a$11$s0pq2G6y4vyN5Z8EzMTFJuJZ64133EjeIW8knPKKM4CReDLR8RH4W", // ChangeMe@2026
                    PinHash = "$2a$11$TxikHLXy.5Ppfke6QsCUhe0X2TYdTURsmuVS5GxfZiOWz2EpFI6gq", // 123456
                    RoleId = RoleDirectorId,
                    IsActive = true,
                    CreatedAt = SeedTimestamp
                }
            );
        }

        private static RolePermission[] BuildGrants(int roleId, (int Id, string Module, string Action)[] all, ref int grantIdCounter, params string[] onlyCodes)
        {
            var source = onlyCodes.Length == 0
                ? all
                : Array.FindAll(all, p => Array.IndexOf(onlyCodes, $"{p.Module}.{p.Action}") >= 0);

            var result = new RolePermission[source.Length];
            for (int i = 0; i < source.Length; i++)
            {
                grantIdCounter++;
                result[i] = new RolePermission
                {
                    Id = grantIdCounter,
                    RoleId = roleId,
                    PermissionId = source[i].Id,
                    CreatedAt = SeedTimestamp
                };
            }

            return result;
        }
    }
}
