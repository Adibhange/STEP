using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace STEP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate_Phase1And2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "audit");

            migrationBuilder.EnsureSchema(
                name: "master");

            migrationBuilder.EnsureSchema(
                name: "staff");

            migrationBuilder.EnsureSchema(
                name: "vacancy");

            migrationBuilder.EnsureSchema(
                name: "question");

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                schema: "audit",
                columns: table => new
                {
                    AuditLogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CorrelationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Changes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.AuditLogId);
                });

            migrationBuilder.CreateTable(
                name: "MasterDepartments",
                schema: "master",
                columns: table => new
                {
                    MasterDepartmentId = table.Column<int>(type: "int", nullable: false)
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
                    table.PrimaryKey("PK_MasterDepartments", x => x.MasterDepartmentId);
                });

            migrationBuilder.CreateTable(
                name: "MasterEmploymentTypes",
                schema: "master",
                columns: table => new
                {
                    MasterEmploymentTypeId = table.Column<int>(type: "int", nullable: false)
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
                    table.PrimaryKey("PK_MasterEmploymentTypes", x => x.MasterEmploymentTypeId);
                });

            migrationBuilder.CreateTable(
                name: "MasterHiringLocations",
                schema: "master",
                columns: table => new
                {
                    MasterHiringLocationId = table.Column<int>(type: "int", nullable: false)
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
                    table.PrimaryKey("PK_MasterHiringLocations", x => x.MasterHiringLocationId);
                });

            migrationBuilder.CreateTable(
                name: "MasterRoles",
                schema: "master",
                columns: table => new
                {
                    MasterRoleId = table.Column<int>(type: "int", nullable: false)
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
                    table.PrimaryKey("PK_MasterRoles", x => x.MasterRoleId);
                });

            migrationBuilder.CreateTable(
                name: "MasterTestLocations",
                schema: "master",
                columns: table => new
                {
                    MasterTestLocationId = table.Column<int>(type: "int", nullable: false)
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
                    table.PrimaryKey("PK_MasterTestLocations", x => x.MasterTestLocationId);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                schema: "master",
                columns: table => new
                {
                    PermissionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Module = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.PermissionId);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                schema: "master",
                columns: table => new
                {
                    RoleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IsSystemRole = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                schema: "master",
                columns: table => new
                {
                    RolePermissionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    PermissionId = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.RolePermissionId);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalSchema: "master",
                        principalTable: "Permissions",
                        principalColumn: "PermissionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "master",
                        principalTable: "Roles",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                schema: "staff",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PinHash = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false),
                    LockoutEnd = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_Users_MasterDepartments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalSchema: "master",
                        principalTable: "MasterDepartments",
                        principalColumn: "MasterDepartmentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "master",
                        principalTable: "Roles",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserRefreshTokens",
                schema: "staff",
                columns: table => new
                {
                    UserRefreshTokenId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    TokenHash = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReplacedByTokenHash = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CreatedByIp = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRefreshTokens", x => x.UserRefreshTokenId);
                    table.ForeignKey(
                        name: "FK_UserRefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "staff",
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vacancies",
                schema: "vacancy",
                columns: table => new
                {
                    VacancyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VacancyCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MasterRoleId = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    HiringLocationId = table.Column<int>(type: "int", nullable: false),
                    EmploymentTypeId = table.Column<int>(type: "int", nullable: false),
                    DriveType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "Draft"),
                    WorkMode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    TotalOpenings = table.Column<int>(type: "int", nullable: false),
                    MinExperienceYears = table.Column<decimal>(type: "decimal(4,1)", nullable: false),
                    MaxExperienceYears = table.Column<decimal>(type: "decimal(4,1)", nullable: false),
                    JobDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClosingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WalkinDriveDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WalkinStartTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    WalkinEndTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    AssignedRecruiterId = table.Column<int>(type: "int", nullable: true),
                    HiringManagerId = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vacancies", x => x.VacancyId);
                    table.ForeignKey(
                        name: "FK_Vacancies_MasterDepartments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalSchema: "master",
                        principalTable: "MasterDepartments",
                        principalColumn: "MasterDepartmentId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Vacancies_MasterEmploymentTypes_EmploymentTypeId",
                        column: x => x.EmploymentTypeId,
                        principalSchema: "master",
                        principalTable: "MasterEmploymentTypes",
                        principalColumn: "MasterEmploymentTypeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Vacancies_MasterHiringLocations_HiringLocationId",
                        column: x => x.HiringLocationId,
                        principalSchema: "master",
                        principalTable: "MasterHiringLocations",
                        principalColumn: "MasterHiringLocationId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Vacancies_MasterRoles_MasterRoleId",
                        column: x => x.MasterRoleId,
                        principalSchema: "master",
                        principalTable: "MasterRoles",
                        principalColumn: "MasterRoleId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Vacancies_Users_AssignedRecruiterId",
                        column: x => x.AssignedRecruiterId,
                        principalSchema: "staff",
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Vacancies_Users_HiringManagerId",
                        column: x => x.HiringManagerId,
                        principalSchema: "staff",
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VacancyAssessmentSections",
                schema: "vacancy",
                columns: table => new
                {
                    VacancyAssessmentSectionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VacancyId = table.Column<int>(type: "int", nullable: false),
                    SectionOrder = table.Column<int>(type: "int", nullable: false),
                    SectionTitle = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    TotalQuestions = table.Column<int>(type: "int", nullable: false),
                    TimeLimitMinutes = table.Column<int>(type: "int", nullable: false),
                    MarksPerQuestion = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    TotalMarks = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VacancyAssessmentSections", x => x.VacancyAssessmentSectionId);
                    table.ForeignKey(
                        name: "FK_VacancyAssessmentSections_Vacancies_VacancyId",
                        column: x => x.VacancyId,
                        principalSchema: "vacancy",
                        principalTable: "Vacancies",
                        principalColumn: "VacancyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VacancyPipelineFlows",
                schema: "vacancy",
                columns: table => new
                {
                    VacancyPipelineFlowId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VacancyId = table.Column<int>(type: "int", nullable: false),
                    VersionName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VacancyPipelineFlows", x => x.VacancyPipelineFlowId);
                    table.ForeignKey(
                        name: "FK_VacancyPipelineFlows_Vacancies_VacancyId",
                        column: x => x.VacancyId,
                        principalSchema: "vacancy",
                        principalTable: "Vacancies",
                        principalColumn: "VacancyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VacancyQuestionPapers",
                schema: "question",
                columns: table => new
                {
                    VacancyQuestionPaperId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VacancyId = table.Column<int>(type: "int", nullable: false),
                    PaperCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PaperVersion = table.Column<int>(type: "int", nullable: false),
                    TotalQuestions = table.Column<int>(type: "int", nullable: false),
                    TotalMarks = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    PassingPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Draft"),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PublishedById = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VacancyQuestionPapers", x => x.VacancyQuestionPaperId);
                    table.ForeignKey(
                        name: "FK_VacancyQuestionPapers_Users_PublishedById",
                        column: x => x.PublishedById,
                        principalSchema: "staff",
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VacancyQuestionPapers_Vacancies_VacancyId",
                        column: x => x.VacancyId,
                        principalSchema: "vacancy",
                        principalTable: "Vacancies",
                        principalColumn: "VacancyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VacancyTestLocations",
                schema: "vacancy",
                columns: table => new
                {
                    VacancyTestLocationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VacancyId = table.Column<int>(type: "int", nullable: false),
                    MasterTestLocationId = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VacancyTestLocations", x => x.VacancyTestLocationId);
                    table.ForeignKey(
                        name: "FK_VacancyTestLocations_MasterTestLocations_MasterTestLocationId",
                        column: x => x.MasterTestLocationId,
                        principalSchema: "master",
                        principalTable: "MasterTestLocations",
                        principalColumn: "MasterTestLocationId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VacancyTestLocations_Vacancies_VacancyId",
                        column: x => x.VacancyId,
                        principalSchema: "vacancy",
                        principalTable: "Vacancies",
                        principalColumn: "VacancyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VacancyPipelineFlowRounds",
                schema: "vacancy",
                columns: table => new
                {
                    VacancyPipelineFlowRoundId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VacancyPipelineFlowId = table.Column<int>(type: "int", nullable: false),
                    RoundOrder = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    RoundType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CutoffPercent = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VacancyPipelineFlowRounds", x => x.VacancyPipelineFlowRoundId);
                    table.ForeignKey(
                        name: "FK_VacancyPipelineFlowRounds_VacancyPipelineFlows_VacancyPipelineFlowId",
                        column: x => x.VacancyPipelineFlowId,
                        principalSchema: "vacancy",
                        principalTable: "VacancyPipelineFlows",
                        principalColumn: "VacancyPipelineFlowId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VacancyQuestions",
                schema: "question",
                columns: table => new
                {
                    VacancyQuestionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VacancyQuestionPaperId = table.Column<int>(type: "int", nullable: false),
                    VacancyAssessmentSectionId = table.Column<int>(type: "int", nullable: true),
                    QuestionNumber = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    QuestionType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Marks = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    TimeAllowedMinutes = table.Column<int>(type: "int", nullable: true),
                    ProgrammingLanguage = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SqlSchema = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaxWordCount = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VacancyQuestions", x => x.VacancyQuestionId);
                    table.ForeignKey(
                        name: "FK_VacancyQuestions_VacancyAssessmentSections_VacancyAssessmentSectionId",
                        column: x => x.VacancyAssessmentSectionId,
                        principalSchema: "vacancy",
                        principalTable: "VacancyAssessmentSections",
                        principalColumn: "VacancyAssessmentSectionId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VacancyQuestions_VacancyQuestionPapers_VacancyQuestionPaperId",
                        column: x => x.VacancyQuestionPaperId,
                        principalSchema: "question",
                        principalTable: "VacancyQuestionPapers",
                        principalColumn: "VacancyQuestionPaperId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VacancyRoundAssessments",
                schema: "vacancy",
                columns: table => new
                {
                    VacancyRoundAssessmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VacancyPipelineFlowRoundId = table.Column<int>(type: "int", nullable: false),
                    VacancyQuestionPaperId = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VacancyRoundAssessments", x => x.VacancyRoundAssessmentId);
                    table.ForeignKey(
                        name: "FK_VacancyRoundAssessments_VacancyPipelineFlowRounds_VacancyPipelineFlowRoundId",
                        column: x => x.VacancyPipelineFlowRoundId,
                        principalSchema: "vacancy",
                        principalTable: "VacancyPipelineFlowRounds",
                        principalColumn: "VacancyPipelineFlowRoundId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VacancyRoundAssessments_VacancyQuestionPapers_VacancyQuestionPaperId",
                        column: x => x.VacancyQuestionPaperId,
                        principalSchema: "question",
                        principalTable: "VacancyQuestionPapers",
                        principalColumn: "VacancyQuestionPaperId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VacancyQuestionOptions",
                schema: "question",
                columns: table => new
                {
                    VacancyQuestionOptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VacancyQuestionId = table.Column<int>(type: "int", nullable: false),
                    OptionLabel = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    OptionText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VacancyQuestionOptions", x => x.VacancyQuestionOptionId);
                    table.ForeignKey(
                        name: "FK_VacancyQuestionOptions_VacancyQuestions_VacancyQuestionId",
                        column: x => x.VacancyQuestionId,
                        principalSchema: "question",
                        principalTable: "VacancyQuestions",
                        principalColumn: "VacancyQuestionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                schema: "master",
                table: "MasterDepartments",
                columns: new[] { "MasterDepartmentId", "Code", "CreatedAt", "CreatedBy", "Description", "IsActive", "IsDeleted", "ModifiedAt", "ModifiedBy", "Name" },
                values: new object[,]
                {
                    { 1, "ENG", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Core Tech & Development", true, false, null, null, "Engineering" },
                    { 2, "PRD", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "UX & Product Strategy", true, false, null, null, "Product Management" },
                    { 3, "TA", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Recruitment & HR", true, false, null, null, "Talent Acquisition" },
                    { 4, "QA", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Software Quality", true, false, null, null, "Quality Assurance" }
                });

            migrationBuilder.InsertData(
                schema: "master",
                table: "MasterEmploymentTypes",
                columns: new[] { "MasterEmploymentTypeId", "Code", "CreatedAt", "CreatedBy", "Description", "IsActive", "IsDeleted", "ModifiedAt", "ModifiedBy", "Name" },
                values: new object[,]
                {
                    { 1, "FT", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Standard employee contract", true, false, null, null, "Full-Time Permanent" },
                    { 2, "CON", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Fixed term contract", true, false, null, null, "Contractual (6-12 Months)" },
                    { 3, "INT", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "6 Months stipend program", true, false, null, null, "Graduate Internship" }
                });

            migrationBuilder.InsertData(
                schema: "master",
                table: "MasterHiringLocations",
                columns: new[] { "MasterHiringLocationId", "Code", "CreatedAt", "CreatedBy", "Description", "IsActive", "IsDeleted", "ModifiedAt", "ModifiedBy", "Name" },
                values: new object[,]
                {
                    { 1, "BOM", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Main Corporate Tower", true, false, null, null, "Mumbai HQ" },
                    { 2, "PNQ", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Hinjawadi IT Hub", true, false, null, null, "Pune Tech Park" },
                    { 3, "BLR", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Outer Ring Road Lab", true, false, null, null, "Bengaluru Innovation Center" },
                    { 4, "REM", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Work from Anywhere (India)", true, false, null, null, "Remote India" }
                });

            migrationBuilder.InsertData(
                schema: "master",
                table: "MasterRoles",
                columns: new[] { "MasterRoleId", "Code", "CreatedAt", "CreatedBy", "Description", "IsActive", "IsDeleted", "ModifiedAt", "ModifiedBy", "Name" },
                values: new object[,]
                {
                    { 1, "SE-01", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Core application developer", true, false, null, null, "Software Engineer" },
                    { 2, "SFE-02", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "React/TypeScript specialist", true, false, null, null, "Senior Frontend Engineer" },
                    { 3, "DE-03", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Cloud infrastructure & CI/CD", true, false, null, null, "DevOps Specialist" },
                    { 4, "QA-04", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Automated test suite author", true, false, null, null, "QA Automation Engineer" },
                    { 5, "PM-05", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Product roadmap & strategy", false, false, null, null, "Product Manager" }
                });

            migrationBuilder.InsertData(
                schema: "master",
                table: "MasterTestLocations",
                columns: new[] { "MasterTestLocationId", "Code", "CreatedAt", "CreatedBy", "Description", "IsActive", "IsDeleted", "ModifiedAt", "ModifiedBy", "Name" },
                values: new object[,]
                {
                    { 1, "TC-BOM-1", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Lab A & B", true, false, null, null, "Mumbai Test Center 1" },
                    { 2, "TC-PNQ-1", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Capacity 150", true, false, null, null, "Pune Assessment Hub" },
                    { 3, "TC-ONLINE", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Webcam AI Proctored", true, false, null, null, "Online Remote Proctored" }
                });

            migrationBuilder.InsertData(
                schema: "master",
                table: "Permissions",
                columns: new[] { "PermissionId", "Action", "Code", "CreatedAt", "CreatedBy", "Description", "IsDeleted", "ModifiedAt", "ModifiedBy", "Module" },
                values: new object[,]
                {
                    { 1, "View", "Vacancy.View", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, false, null, null, "Vacancy" },
                    { 2, "Create", "Vacancy.Create", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, false, null, null, "Vacancy" },
                    { 3, "View", "Candidate.View", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, false, null, null, "Candidate" },
                    { 4, "Approve", "Candidate.Approve", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, false, null, null, "Candidate" },
                    { 5, "Manage", "Exam.Manage", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, false, null, null, "Exam" },
                    { 6, "View", "Report.View", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, false, null, null, "Report" },
                    { 7, "Manage", "User.Manage", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, false, null, null, "User" },
                    { 8, "Manage", "MasterData.Manage", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, false, null, null, "MasterData" }
                });

            migrationBuilder.InsertData(
                schema: "master",
                table: "Roles",
                columns: new[] { "RoleId", "CreatedAt", "CreatedBy", "Description", "IsDeleted", "IsSystemRole", "ModifiedAt", "ModifiedBy", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Full system access", false, true, null, null, "Administrator" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "High-privilege approvals via PIN", false, true, null, null, "Director" },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Recruitment operations", false, true, null, null, "HR" },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Interview panel member", false, true, null, null, "Interviewer" }
                });

            migrationBuilder.InsertData(
                schema: "master",
                table: "RolePermissions",
                columns: new[] { "RolePermissionId", "CreatedAt", "CreatedBy", "IsDeleted", "ModifiedAt", "ModifiedBy", "PermissionId", "RoleId" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 1, 1 },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 2, 1 },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 3, 1 },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 4, 1 },
                    { 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 5, 1 },
                    { 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 6, 1 },
                    { 7, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 7, 1 },
                    { 8, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 8, 1 },
                    { 9, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 1, 2 },
                    { 10, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 2, 2 },
                    { 11, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 3, 2 },
                    { 12, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 4, 2 },
                    { 13, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 5, 2 },
                    { 14, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 6, 2 },
                    { 15, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 7, 2 },
                    { 16, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 8, 2 },
                    { 17, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 1, 3 },
                    { 18, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 2, 3 },
                    { 19, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 3, 3 },
                    { 20, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 4, 3 },
                    { 21, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 6, 3 },
                    { 22, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 3, 4 },
                    { 23, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, false, null, null, 5, 4 }
                });

            migrationBuilder.InsertData(
                schema: "staff",
                table: "Users",
                columns: new[] { "UserId", "AccessFailedCount", "CreatedAt", "CreatedBy", "DepartmentId", "Email", "EmployeeCode", "FirstName", "IsActive", "IsDeleted", "LastLoginAt", "LastName", "LockoutEnd", "ModifiedAt", "ModifiedBy", "PasswordHash", "PinHash", "RoleId" },
                values: new object[,]
                {
                    { 1, 0, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "admin@sthapatya.in", "EMP-0001", "System", true, false, null, "Administrator", null, null, null, "$2a$11$s0pq2G6y4vyN5Z8EzMTFJuJZ64133EjeIW8knPKKM4CReDLR8RH4W", null, 1 },
                    { 2, 0, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, null, "director@sthapatya.in", "EMP-0002", "Founding", true, false, null, "Director", null, null, null, "$2a$11$s0pq2G6y4vyN5Z8EzMTFJuJZ64133EjeIW8knPKKM4CReDLR8RH4W", "$2a$11$TxikHLXy.5Ppfke6QsCUhe0X2TYdTURsmuVS5GxfZiOWz2EpFI6gq", 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_CorrelationId",
                schema: "audit",
                table: "AuditLogs",
                column: "CorrelationId");

            migrationBuilder.CreateIndex(
                name: "IX_MasterDepartments_Code",
                schema: "master",
                table: "MasterDepartments",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MasterEmploymentTypes_Code",
                schema: "master",
                table: "MasterEmploymentTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MasterHiringLocations_Code",
                schema: "master",
                table: "MasterHiringLocations",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MasterRoles_Code",
                schema: "master",
                table: "MasterRoles",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MasterTestLocations_Code",
                schema: "master",
                table: "MasterTestLocations",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_Code",
                schema: "master",
                table: "Permissions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                schema: "master",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId_PermissionId",
                schema: "master",
                table: "RolePermissions",
                columns: new[] { "RoleId", "PermissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                schema: "master",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRefreshTokens_TokenHash",
                schema: "staff",
                table: "UserRefreshTokens",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRefreshTokens_UserId",
                schema: "staff",
                table: "UserRefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_DepartmentId",
                schema: "staff",
                table: "Users",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                schema: "staff",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_EmployeeCode",
                schema: "staff",
                table: "Users",
                column: "EmployeeCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                schema: "staff",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Vacancies_AssignedRecruiterId",
                schema: "vacancy",
                table: "Vacancies",
                column: "AssignedRecruiterId");

            migrationBuilder.CreateIndex(
                name: "IX_Vacancies_DepartmentId",
                schema: "vacancy",
                table: "Vacancies",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Vacancies_EmploymentTypeId",
                schema: "vacancy",
                table: "Vacancies",
                column: "EmploymentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Vacancies_HiringLocationId",
                schema: "vacancy",
                table: "Vacancies",
                column: "HiringLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Vacancies_HiringManagerId",
                schema: "vacancy",
                table: "Vacancies",
                column: "HiringManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Vacancies_MasterRoleId",
                schema: "vacancy",
                table: "Vacancies",
                column: "MasterRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Vacancies_VacancyCode",
                schema: "vacancy",
                table: "Vacancies",
                column: "VacancyCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VacancyAssessmentSections_VacancyId_SectionOrder",
                schema: "vacancy",
                table: "VacancyAssessmentSections",
                columns: new[] { "VacancyId", "SectionOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VacancyPipelineFlowRounds_VacancyPipelineFlowId_RoundOrder",
                schema: "vacancy",
                table: "VacancyPipelineFlowRounds",
                columns: new[] { "VacancyPipelineFlowId", "RoundOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VacancyPipelineFlows_VacancyId",
                schema: "vacancy",
                table: "VacancyPipelineFlows",
                column: "VacancyId");

            migrationBuilder.CreateIndex(
                name: "IX_VacancyQuestionOptions_VacancyQuestionId",
                schema: "question",
                table: "VacancyQuestionOptions",
                column: "VacancyQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_VacancyQuestionPapers_PaperCode",
                schema: "question",
                table: "VacancyQuestionPapers",
                column: "PaperCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VacancyQuestionPapers_PublishedById",
                schema: "question",
                table: "VacancyQuestionPapers",
                column: "PublishedById");

            migrationBuilder.CreateIndex(
                name: "IX_VacancyQuestionPapers_VacancyId",
                schema: "question",
                table: "VacancyQuestionPapers",
                column: "VacancyId");

            migrationBuilder.CreateIndex(
                name: "IX_VacancyQuestions_VacancyAssessmentSectionId",
                schema: "question",
                table: "VacancyQuestions",
                column: "VacancyAssessmentSectionId");

            migrationBuilder.CreateIndex(
                name: "IX_VacancyQuestions_VacancyQuestionPaperId",
                schema: "question",
                table: "VacancyQuestions",
                column: "VacancyQuestionPaperId");

            migrationBuilder.CreateIndex(
                name: "IX_VacancyRoundAssessments_VacancyPipelineFlowRoundId",
                schema: "vacancy",
                table: "VacancyRoundAssessments",
                column: "VacancyPipelineFlowRoundId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VacancyRoundAssessments_VacancyQuestionPaperId",
                schema: "vacancy",
                table: "VacancyRoundAssessments",
                column: "VacancyQuestionPaperId");

            migrationBuilder.CreateIndex(
                name: "IX_VacancyTestLocations_MasterTestLocationId",
                schema: "vacancy",
                table: "VacancyTestLocations",
                column: "MasterTestLocationId");

            migrationBuilder.CreateIndex(
                name: "IX_VacancyTestLocations_VacancyId_MasterTestLocationId",
                schema: "vacancy",
                table: "VacancyTestLocations",
                columns: new[] { "VacancyId", "MasterTestLocationId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs",
                schema: "audit");

            migrationBuilder.DropTable(
                name: "RolePermissions",
                schema: "master");

            migrationBuilder.DropTable(
                name: "UserRefreshTokens",
                schema: "staff");

            migrationBuilder.DropTable(
                name: "VacancyQuestionOptions",
                schema: "question");

            migrationBuilder.DropTable(
                name: "VacancyRoundAssessments",
                schema: "vacancy");

            migrationBuilder.DropTable(
                name: "VacancyTestLocations",
                schema: "vacancy");

            migrationBuilder.DropTable(
                name: "Permissions",
                schema: "master");

            migrationBuilder.DropTable(
                name: "VacancyQuestions",
                schema: "question");

            migrationBuilder.DropTable(
                name: "VacancyPipelineFlowRounds",
                schema: "vacancy");

            migrationBuilder.DropTable(
                name: "MasterTestLocations",
                schema: "master");

            migrationBuilder.DropTable(
                name: "VacancyAssessmentSections",
                schema: "vacancy");

            migrationBuilder.DropTable(
                name: "VacancyQuestionPapers",
                schema: "question");

            migrationBuilder.DropTable(
                name: "VacancyPipelineFlows",
                schema: "vacancy");

            migrationBuilder.DropTable(
                name: "Vacancies",
                schema: "vacancy");

            migrationBuilder.DropTable(
                name: "MasterEmploymentTypes",
                schema: "master");

            migrationBuilder.DropTable(
                name: "MasterHiringLocations",
                schema: "master");

            migrationBuilder.DropTable(
                name: "MasterRoles",
                schema: "master");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "staff");

            migrationBuilder.DropTable(
                name: "MasterDepartments",
                schema: "master");

            migrationBuilder.DropTable(
                name: "Roles",
                schema: "master");
        }
    }
}
