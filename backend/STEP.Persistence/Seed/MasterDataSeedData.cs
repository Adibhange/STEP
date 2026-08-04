using System;
using Microsoft.EntityFrameworkCore;
using STEP.Domain.Entities.Master;

namespace STEP.Persistence.Seed
{
    /// <summary>
    /// Seeds the five Phase 1 master-data taxonomies with the same records the frontend currently
    /// renders from src/features/settings/mock/master.mock.ts, so the two stay in lockstep once
    /// the settings screen is wired to the real API.
    /// </summary>
    public static class MasterDataSeedData
    {
        private static readonly DateTime SeedTimestamp = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public static void Seed(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MasterRole>().HasData(
                Row<MasterRole>(1, "Software Engineer", "SE-01", "Core application developer"),
                Row<MasterRole>(2, "Senior Frontend Engineer", "SFE-02", "React/TypeScript specialist"),
                Row<MasterRole>(3, "DevOps Specialist", "DE-03", "Cloud infrastructure & CI/CD"),
                Row<MasterRole>(4, "QA Automation Engineer", "QA-04", "Automated test suite author"),
                Row<MasterRole>(5, "Product Manager", "PM-05", "Product roadmap & strategy", isActive: false)
            );

            modelBuilder.Entity<MasterDepartment>().HasData(
                Row<MasterDepartment>(1, "Engineering", "ENG", "Core Tech & Development"),
                Row<MasterDepartment>(2, "Product Management", "PRD", "UX & Product Strategy"),
                Row<MasterDepartment>(3, "Talent Acquisition", "TA", "Recruitment & HR"),
                Row<MasterDepartment>(4, "Quality Assurance", "QA", "Software Quality")
            );

            modelBuilder.Entity<MasterHiringLocation>().HasData(
                Row<MasterHiringLocation>(1, "Mumbai HQ", "BOM", "Main Corporate Tower"),
                Row<MasterHiringLocation>(2, "Pune Tech Park", "PNQ", "Hinjawadi IT Hub"),
                Row<MasterHiringLocation>(3, "Bengaluru Innovation Center", "BLR", "Outer Ring Road Lab"),
                Row<MasterHiringLocation>(4, "Remote India", "REM", "Work from Anywhere (India)")
            );

            modelBuilder.Entity<MasterTestLocation>().HasData(
                Row<MasterTestLocation>(1, "Mumbai Test Center 1", "TC-BOM-1", "Lab A & B"),
                Row<MasterTestLocation>(2, "Pune Assessment Hub", "TC-PNQ-1", "Capacity 150"),
                Row<MasterTestLocation>(3, "Online Remote Proctored", "TC-ONLINE", "Webcam AI Proctored")
            );

            modelBuilder.Entity<MasterEmploymentType>().HasData(
                Row<MasterEmploymentType>(1, "Full-Time Permanent", "FT", "Standard employee contract"),
                Row<MasterEmploymentType>(2, "Contractual (6-12 Months)", "CON", "Fixed term contract"),
                Row<MasterEmploymentType>(3, "Graduate Internship", "INT", "6 Months stipend program")
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
    }
}
