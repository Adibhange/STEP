using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace STEP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase7_MasterExperienceLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MasterExperienceLevels",
                schema: "master",
                columns: table => new
                {
                    MasterExperienceLevelId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterExperienceLevels", x => x.MasterExperienceLevelId);
                });

            migrationBuilder.InsertData(
                schema: "master",
                table: "MasterExperienceLevels",
                columns: new[] { "MasterExperienceLevelId", "Code", "CreatedAt", "CreatedBy", "Description", "IsActive", "IsDeleted", "ModifiedAt", "ModifiedBy", "Name" },
                values: new object[,]
                {
                    { 1, "EXP-0", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "No prior professional experience", true, false, null, null, "Fresher (0 Years)" },
                    { 2, "EXP-1", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Up to 1 year of experience", true, false, null, null, "Junior (0-1 Year)" },
                    { 3, "EXP-3", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "1 to 3 years of experience", true, false, null, null, "Mid-Level (1-3 Years)" },
                    { 4, "EXP-5", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "3 to 5 years of experience", true, false, null, null, "Senior (3-5 Years)" },
                    { 5, "EXP-8", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "5 to 8 years of experience", true, false, null, null, "Lead (5-8 Years)" },
                    { 6, "EXP-8P", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "8 or more years of experience", true, false, null, null, "Principal (8+ Years)" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_MasterExperienceLevels_Code",
                schema: "master",
                table: "MasterExperienceLevels",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MasterExperienceLevels",
                schema: "master");
        }
    }
}
