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

            modelBuilder.Entity<MasterTestLocation>().HasData(
                Row<MasterTestLocation>(1, "Pune Office - Main Center", "TC-PUNE-1", "Lab A & B (Capacity 150)"),
                Row<MasterTestLocation>(2, "Online Remote Proctored", "TC-ONLINE", "Webcam AI Proctored Assessment")
            );

            modelBuilder.Entity<MasterEmploymentType>().HasData(
                Row<MasterEmploymentType>(1, "Full-Time Permanent", "FT", "Standard employee contract"),
                Row<MasterEmploymentType>(2, "Contractual (6-12 Months)", "CON", "Fixed term contract"),
                Row<MasterEmploymentType>(3, "Graduate Internship", "INT", "6 Months stipend program")
            );

            modelBuilder.Entity<MasterExperienceLevel>().HasData(
                Row<MasterExperienceLevel>(1, "Fresher (0 Years)", "EXP-0", "No prior professional experience"),
                Row<MasterExperienceLevel>(2, "Junior (0-1 Year)", "EXP-1", "Up to 1 year of experience"),
                Row<MasterExperienceLevel>(3, "Mid-Level (1-3 Years)", "EXP-3", "1 to 3 years of experience"),
                Row<MasterExperienceLevel>(4, "Senior (3-5 Years)", "EXP-5", "3 to 5 years of experience"),
                Row<MasterExperienceLevel>(5, "Lead (5-8 Years)", "EXP-8", "5 to 8 years of experience"),
                Row<MasterExperienceLevel>(6, "Principal (8+ Years)", "EXP-8P", "8 or more years of experience")
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
