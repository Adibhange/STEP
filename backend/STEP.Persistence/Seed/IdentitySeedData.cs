using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using STEP.Domain.Entities.Identity;

namespace STEP.Persistence.Seed
{
    /// <summary>
    /// Deterministic Phase 1 seed data: RBAC roles, permissions, role-permission grants,
    /// and single HR user (hr@sthapatya.com / user@123).
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

            var grants = new List<RolePermission>();
            var grantIdCounter = 1;

            void AddGrants(int roleId, params string[] onlyCodes)
            {
                var source = onlyCodes.Length == 0
                    ? PermissionSeed
                    : Array.FindAll(PermissionSeed, p => Array.IndexOf(onlyCodes, $"{p.Module}.{p.Action}") >= 0);

                foreach (var p in source)
                {
                    grants.Add(new RolePermission
                    {
                        Id = grantIdCounter++,
                        RoleId = roleId,
                        PermissionId = p.Id,
                        CreatedAt = SeedTimestamp
                    });
                }
            }

            // Director and HR carry every permission — both roles need to be able to complete
            // the full vacancy-to-exam lifecycle (create vacancy, build assessment pattern,
            // import/publish question papers) without a separate role handing off mid-flow.
            AddGrants(RoleDirectorId);
            AddGrants(RoleHRId);
            AddGrants(RoleInterviewerId, "Candidate.View", "Exam.Manage");

            modelBuilder.Entity<RolePermission>().HasData(grants);
        }
    }
}
