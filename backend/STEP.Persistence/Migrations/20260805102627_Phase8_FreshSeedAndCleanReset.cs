using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace STEP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase8_FreshSeedAndCleanReset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF OBJECT_ID('exam.CandidateExamAnswers') IS NOT NULL DELETE FROM exam.CandidateExamAnswers;
                IF OBJECT_ID('exam.CandidateExamSessionQuestions') IS NOT NULL DELETE FROM exam.CandidateExamSessionQuestions;
                IF OBJECT_ID('exam.CandidateExamSessions') IS NOT NULL DELETE FROM exam.CandidateExamSessions;
                IF OBJECT_ID('candidate.CandidatePipelineProgress') IS NOT NULL DELETE FROM candidate.CandidatePipelineProgress;
                IF OBJECT_ID('candidate.CandidateDocuments') IS NOT NULL DELETE FROM candidate.CandidateDocuments;
                IF OBJECT_ID('candidate.Candidates') IS NOT NULL DELETE FROM candidate.Candidates;
                IF OBJECT_ID('vacancy.OfferLetters') IS NOT NULL DELETE FROM vacancy.OfferLetters;
                IF OBJECT_ID('vacancy.VacancyQuestions') IS NOT NULL DELETE FROM vacancy.VacancyQuestions;
                IF OBJECT_ID('vacancy.VacancyQuestionPapers') IS NOT NULL DELETE FROM vacancy.VacancyQuestionPapers;
                IF OBJECT_ID('vacancy.VacancyAssessmentSections') IS NOT NULL DELETE FROM vacancy.VacancyAssessmentSections;
                IF OBJECT_ID('vacancy.VacancyPipelineFlowRounds') IS NOT NULL DELETE FROM vacancy.VacancyPipelineFlowRounds;
                IF OBJECT_ID('vacancy.VacancyPipelineFlows') IS NOT NULL DELETE FROM vacancy.VacancyPipelineFlows;
                IF OBJECT_ID('vacancy.VacancyRecruiters') IS NOT NULL DELETE FROM vacancy.VacancyRecruiters;
                IF OBJECT_ID('vacancy.VacancyTestLocations') IS NOT NULL DELETE FROM vacancy.VacancyTestLocations;
                IF OBJECT_ID('vacancy.Vacancies') IS NOT NULL DELETE FROM vacancy.Vacancies;
                IF OBJECT_ID('interview.InterviewRoundDetails') IS NOT NULL DELETE FROM interview.InterviewRoundDetails;
                IF OBJECT_ID('interview.Interviews') IS NOT NULL DELETE FROM interview.Interviews;
                IF OBJECT_ID('audit.AuditLogs') IS NOT NULL DELETE FROM audit.AuditLogs;
                IF OBJECT_ID('qr.QRScanAnalytics') IS NOT NULL DELETE FROM qr.QRScanAnalytics;
                IF OBJECT_ID('qr.QRCodes') IS NOT NULL DELETE FROM qr.QRCodes;
                IF OBJECT_ID('notification.OutboxMessages') IS NOT NULL DELETE FROM notification.OutboxMessages;
                IF OBJECT_ID('staff.UserRefreshTokens') IS NOT NULL DELETE FROM staff.UserRefreshTokens;
                IF OBJECT_ID('staff.Users') IS NOT NULL DELETE FROM staff.Users;
                IF OBJECT_ID('master.RolePermissions') IS NOT NULL DELETE FROM master.RolePermissions;
            ");
            migrationBuilder.DeleteData(
                schema: "master",
                table: "MasterDepartments",
                keyColumn: "MasterDepartmentId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                schema: "master",
                table: "MasterHiringLocations",
                keyColumn: "MasterHiringLocationId",
                keyValue: 2);

            migrationBuilder.DeleteData(
                schema: "master",
                table: "MasterHiringLocations",
                keyColumn: "MasterHiringLocationId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                schema: "master",
                table: "MasterHiringLocations",
                keyColumn: "MasterHiringLocationId",
                keyValue: 4);

            migrationBuilder.DeleteData(
                schema: "master",
                table: "MasterRoles",
                keyColumn: "MasterRoleId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                schema: "master",
                table: "MasterTestLocations",
                keyColumn: "MasterTestLocationId",
                keyValue: 3);

            migrationBuilder.DeleteData(
                schema: "staff",
                table: "Users",
                keyColumn: "UserId",
                keyValue: 2);

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterDepartments",
                keyColumn: "MasterDepartmentId",
                keyValue: 1,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "PROD", "Core Production Operations", "Production" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterDepartments",
                keyColumn: "MasterDepartmentId",
                keyValue: 2,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "AMC", "Annual Maintenance Contracts", "AMC" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterDepartments",
                keyColumn: "MasterDepartmentId",
                keyValue: 3,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "HRIT", "Human Resources & Technology Services", "HR & IT" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterHiringLocations",
                keyColumn: "MasterHiringLocationId",
                keyValue: 1,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "PUNE", "Pune Corporate HQ & Assessment Hub", "Pune Office" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterRoles",
                keyColumn: "MasterRoleId",
                keyValue: 1,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "DOTNET", "C# .NET Enterprise Software Developer", ".NET Developer" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterRoles",
                keyColumn: "MasterRoleId",
                keyValue: 2,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "DATA", "Data Analytics & Engineering", "Data Analyst" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterRoles",
                keyColumn: "MasterRoleId",
                keyValue: 3,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "SE", "Full Stack Web Developer", "Software Engineer" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterRoles",
                keyColumn: "MasterRoleId",
                keyValue: 4,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "DEVOPS", "Cloud Infrastructure & Automation", "DevOps Specialist" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterTestLocations",
                keyColumn: "MasterTestLocationId",
                keyValue: 1,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "TC-PUNE-1", "Lab A & B (Capacity 150)", "Pune Office - Main Center" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterTestLocations",
                keyColumn: "MasterTestLocationId",
                keyValue: 2,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "TC-ONLINE", "Webcam AI Proctored Assessment", "Online Remote Proctored" });

            migrationBuilder.UpdateData(
                schema: "staff",
                table: "Users",
                keyColumn: "UserId",
                keyValue: 1,
                columns: new[] { "Email", "FirstName", "LastName", "PasswordHash", "RoleId" },
                values: new object[] { "hr@sthapatya.com", "HR", "Specialist", "$2a$11$e87.g5vQyV.H098FkQzGgO3/6PzK0vF.p4XpG4lQ9T0E3n.K.M3Sm", 3 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterDepartments",
                keyColumn: "MasterDepartmentId",
                keyValue: 1,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "ENG", "Core Tech & Development", "Engineering" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterDepartments",
                keyColumn: "MasterDepartmentId",
                keyValue: 2,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "PRD", "UX & Product Strategy", "Product Management" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterDepartments",
                keyColumn: "MasterDepartmentId",
                keyValue: 3,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "TA", "Recruitment & HR", "Talent Acquisition" });

            migrationBuilder.InsertData(
                schema: "master",
                table: "MasterDepartments",
                columns: new[] { "MasterDepartmentId", "Code", "CreatedAt", "CreatedBy", "Description", "IsActive", "IsDeleted", "ModifiedAt", "ModifiedBy", "Name" },
                values: new object[] { 4, "QA", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Software Quality", true, false, null, null, "Quality Assurance" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterHiringLocations",
                keyColumn: "MasterHiringLocationId",
                keyValue: 1,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "BOM", "Main Corporate Tower", "Mumbai HQ" });

            migrationBuilder.InsertData(
                schema: "master",
                table: "MasterHiringLocations",
                columns: new[] { "MasterHiringLocationId", "Code", "CreatedAt", "CreatedBy", "Description", "IsActive", "IsDeleted", "ModifiedAt", "ModifiedBy", "Name" },
                values: new object[,]
                {
                    { 2, "PNQ", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Hinjawadi IT Hub", true, false, null, null, "Pune Tech Park" },
                    { 3, "BLR", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Outer Ring Road Lab", true, false, null, null, "Bengaluru Innovation Center" },
                    { 4, "REM", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Work from Anywhere (India)", true, false, null, null, "Remote India" }
                });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterRoles",
                keyColumn: "MasterRoleId",
                keyValue: 1,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "SE-01", "Core application developer", "Software Engineer" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterRoles",
                keyColumn: "MasterRoleId",
                keyValue: 2,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "SFE-02", "React/TypeScript specialist", "Senior Frontend Engineer" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterRoles",
                keyColumn: "MasterRoleId",
                keyValue: 3,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "DE-03", "Cloud infrastructure & CI/CD", "DevOps Specialist" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterRoles",
                keyColumn: "MasterRoleId",
                keyValue: 4,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "QA-04", "Automated test suite author", "QA Automation Engineer" });

            migrationBuilder.InsertData(
                schema: "master",
                table: "MasterRoles",
                columns: new[] { "MasterRoleId", "Code", "CreatedAt", "CreatedBy", "Description", "IsActive", "IsDeleted", "ModifiedAt", "ModifiedBy", "Name" },
                values: new object[] { 5, "PM-05", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Product roadmap & strategy", false, false, null, null, "Product Manager" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterTestLocations",
                keyColumn: "MasterTestLocationId",
                keyValue: 1,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "TC-BOM-1", "Lab A & B", "Mumbai Test Center 1" });

            migrationBuilder.UpdateData(
                schema: "master",
                table: "MasterTestLocations",
                keyColumn: "MasterTestLocationId",
                keyValue: 2,
                columns: new[] { "Code", "Description", "Name" },
                values: new object[] { "TC-PNQ-1", "Capacity 150", "Pune Assessment Hub" });

            migrationBuilder.InsertData(
                schema: "master",
                table: "MasterTestLocations",
                columns: new[] { "MasterTestLocationId", "Code", "CreatedAt", "CreatedBy", "Description", "IsActive", "IsDeleted", "ModifiedAt", "ModifiedBy", "Name" },
                values: new object[] { 3, "TC-ONLINE", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Webcam AI Proctored", true, false, null, null, "Online Remote Proctored" });

            migrationBuilder.UpdateData(
                schema: "staff",
                table: "Users",
                keyColumn: "UserId",
                keyValue: 1,
                columns: new[] { "Email", "FirstName", "LastName", "PasswordHash", "RoleId" },
                values: new object[] { "admin@sthapatya.in", "System", "Administrator", "$2a$11$s0pq2G6y4vyN5Z8EzMTFJuJZ64133EjeIW8knPKKM4CReDLR8RH4W", 1 });

            migrationBuilder.InsertData(
                schema: "staff",
                table: "Users",
                columns: new[] { "UserId", "AccessFailedCount", "CreatedAt", "CreatedBy", "DepartmentId", "Email", "EmployeeCode", "FirstName", "IsActive", "IsDeleted", "LastLoginAt", "LastName", "LockoutEnd", "ModifiedAt", "ModifiedBy", "PasswordHash", "PinHash", "RoleId" },
                values: new object[] { 2, 0, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "director@sthapatya.in", "EMP-0002", "Founding", true, false, null, "Director", null, null, null, "$2a$11$s0pq2G6y4vyN5Z8EzMTFJuJZ64133EjeIW8knPKKM4CReDLR8RH4W", "$2a$11$TxikHLXy.5Ppfke6QsCUhe0X2TYdTURsmuVS5GxfZiOWz2EpFI6gq", 2 });
        }
    }
}
