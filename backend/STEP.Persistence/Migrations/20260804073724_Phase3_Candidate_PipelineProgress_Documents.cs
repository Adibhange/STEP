using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STEP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase3_Candidate_PipelineProgress_Documents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "candidate");

            migrationBuilder.CreateTable(
                name: "CandidateDocuments",
                schema: "candidate",
                columns: table => new
                {
                    CandidateDocumentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateId = table.Column<int>(type: "int", nullable: false),
                    DocumentType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    StorageProvider = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "Local"),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UploadedById = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateDocuments", x => x.CandidateDocumentId);
                    table.ForeignKey(
                        name: "FK_CandidateDocuments_Users_UploadedById",
                        column: x => x.UploadedById,
                        principalSchema: "staff",
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CandidatePipelineProgress",
                schema: "candidate",
                columns: table => new
                {
                    CandidatePipelineProgressId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateId = table.Column<int>(type: "int", nullable: false),
                    VacancyPipelineFlowRoundId = table.Column<int>(type: "int", nullable: false),
                    RoundNumber = table.Column<int>(type: "int", nullable: false),
                    RoundTitle = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RoundType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "Assigned"),
                    ScoreObtained = table.Column<decimal>(type: "decimal(6,2)", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EvaluatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EvaluatorId = table.Column<int>(type: "int", nullable: true),
                    SkippedById = table.Column<int>(type: "int", nullable: true),
                    SkipReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidatePipelineProgress", x => x.CandidatePipelineProgressId);
                    table.ForeignKey(
                        name: "FK_CandidatePipelineProgress_Users_EvaluatorId",
                        column: x => x.EvaluatorId,
                        principalSchema: "staff",
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CandidatePipelineProgress_Users_SkippedById",
                        column: x => x.SkippedById,
                        principalSchema: "staff",
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CandidatePipelineProgress_VacancyPipelineFlowRounds_VacancyPipelineFlowRoundId",
                        column: x => x.VacancyPipelineFlowRoundId,
                        principalSchema: "vacancy",
                        principalTable: "VacancyPipelineFlowRounds",
                        principalColumn: "VacancyPipelineFlowRoundId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Candidates",
                schema: "candidate",
                columns: table => new
                {
                    CandidateId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    VacancyId = table.Column<int>(type: "int", nullable: false),
                    CurrentPipelineProgressId = table.Column<int>(type: "int", nullable: true),
                    CurrentStage = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "Applied"),
                    RegistrationChannel = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ReferralEmployeeName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TotalExperienceYears = table.Column<decimal>(type: "decimal(4,1)", nullable: false),
                    CurrentCTC = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    ExpectedCTC = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    NoticePeriodDays = table.Column<int>(type: "int", nullable: true),
                    CurrentLocation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    HighestQualification = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Candidates", x => x.CandidateId);
                    table.ForeignKey(
                        name: "FK_Candidates_CandidatePipelineProgress_CurrentPipelineProgressId",
                        column: x => x.CurrentPipelineProgressId,
                        principalSchema: "candidate",
                        principalTable: "CandidatePipelineProgress",
                        principalColumn: "CandidatePipelineProgressId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Candidates_Vacancies_VacancyId",
                        column: x => x.VacancyId,
                        principalSchema: "vacancy",
                        principalTable: "Vacancies",
                        principalColumn: "VacancyId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CandidateDocuments_CandidateId_DocumentType",
                schema: "candidate",
                table: "CandidateDocuments",
                columns: new[] { "CandidateId", "DocumentType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CandidateDocuments_UploadedById",
                schema: "candidate",
                table: "CandidateDocuments",
                column: "UploadedById");

            migrationBuilder.CreateIndex(
                name: "IX_CandidatePipelineProgress_CandidateId_RoundNumber",
                schema: "candidate",
                table: "CandidatePipelineProgress",
                columns: new[] { "CandidateId", "RoundNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CandidatePipelineProgress_EvaluatorId",
                schema: "candidate",
                table: "CandidatePipelineProgress",
                column: "EvaluatorId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidatePipelineProgress_SkippedById",
                schema: "candidate",
                table: "CandidatePipelineProgress",
                column: "SkippedById");

            migrationBuilder.CreateIndex(
                name: "IX_CandidatePipelineProgress_VacancyPipelineFlowRoundId",
                schema: "candidate",
                table: "CandidatePipelineProgress",
                column: "VacancyPipelineFlowRoundId");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_CandidateCode",
                schema: "candidate",
                table: "Candidates",
                column: "CandidateCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_CurrentPipelineProgressId",
                schema: "candidate",
                table: "Candidates",
                column: "CurrentPipelineProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_Email",
                schema: "candidate",
                table: "Candidates",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_VacancyId",
                schema: "candidate",
                table: "Candidates",
                column: "VacancyId");

            migrationBuilder.AddForeignKey(
                name: "FK_CandidateDocuments_Candidates_CandidateId",
                schema: "candidate",
                table: "CandidateDocuments",
                column: "CandidateId",
                principalSchema: "candidate",
                principalTable: "Candidates",
                principalColumn: "CandidateId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CandidatePipelineProgress_Candidates_CandidateId",
                schema: "candidate",
                table: "CandidatePipelineProgress",
                column: "CandidateId",
                principalSchema: "candidate",
                principalTable: "Candidates",
                principalColumn: "CandidateId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CandidatePipelineProgress_Candidates_CandidateId",
                schema: "candidate",
                table: "CandidatePipelineProgress");

            migrationBuilder.DropTable(
                name: "CandidateDocuments",
                schema: "candidate");

            migrationBuilder.DropTable(
                name: "Candidates",
                schema: "candidate");

            migrationBuilder.DropTable(
                name: "CandidatePipelineProgress",
                schema: "candidate");
        }
    }
}
