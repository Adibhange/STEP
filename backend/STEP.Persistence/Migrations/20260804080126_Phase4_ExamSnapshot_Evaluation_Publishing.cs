using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STEP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase4_ExamSnapshot_Evaluation_Publishing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "exam");

            migrationBuilder.AddColumn<string>(
                name: "ExamPasscodeHash",
                schema: "candidate",
                table: "Candidates",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CandidateExamSessions",
                schema: "exam",
                columns: table => new
                {
                    CandidateExamSessionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateId = table.Column<int>(type: "int", nullable: false),
                    VacancyId = table.Column<int>(type: "int", nullable: false),
                    VacancyQuestionPaperId = table.Column<int>(type: "int", nullable: false),
                    CandidatePipelineProgressId = table.Column<int>(type: "int", nullable: true),
                    SessionToken = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AttemptNumber = table.Column<int>(type: "int", nullable: false),
                    ShuffleSeed = table.Column<int>(type: "int", nullable: false),
                    SnapshotCandidateName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SnapshotCandidateCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    SnapshotVacancyTitle = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SnapshotVacancyCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    SnapshotPaperCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    SnapshotPaperTitle = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    OriginalPaperVersion = table.Column<int>(type: "int", nullable: false),
                    FrozenAssessmentMode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TestSource = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FrozenIPAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FrozenBrowser = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    FrozenOS = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FrozenDeviceType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    FrozenTotalDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    FrozenPassingPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    FrozenShuffleEnabled = table.Column<bool>(type: "bit", nullable: false),
                    FrozenOptionShuffleEnabled = table.Column<bool>(type: "bit", nullable: false),
                    SessionStatus = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "Created"),
                    EvaluationStatus = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "Pending"),
                    TotalScore = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    TotalMarks = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    Percentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    ResultStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    AssessmentIntegrityScore = table.Column<decimal>(type: "decimal(5,2)", nullable: false, defaultValue: 100.00m),
                    TabSwitchWarnings = table.Column<int>(type: "int", nullable: false),
                    TotalTimeLeftSeconds = table.Column<int>(type: "int", nullable: false),
                    ActiveQuestionIndex = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EvaluatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EvaluatorId = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateExamSessions", x => x.CandidateExamSessionId);
                    table.ForeignKey(
                        name: "FK_CandidateExamSessions_CandidatePipelineProgress_CandidatePipelineProgressId",
                        column: x => x.CandidatePipelineProgressId,
                        principalSchema: "candidate",
                        principalTable: "CandidatePipelineProgress",
                        principalColumn: "CandidatePipelineProgressId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CandidateExamSessions_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalSchema: "candidate",
                        principalTable: "Candidates",
                        principalColumn: "CandidateId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CandidateExamSessions_Users_EvaluatorId",
                        column: x => x.EvaluatorId,
                        principalSchema: "staff",
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CandidateExamSessions_Vacancies_VacancyId",
                        column: x => x.VacancyId,
                        principalSchema: "vacancy",
                        principalTable: "Vacancies",
                        principalColumn: "VacancyId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CandidateExamSessions_VacancyQuestionPapers_VacancyQuestionPaperId",
                        column: x => x.VacancyQuestionPaperId,
                        principalSchema: "question",
                        principalTable: "VacancyQuestionPapers",
                        principalColumn: "VacancyQuestionPaperId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CandidateExamSessionQuestions",
                schema: "exam",
                columns: table => new
                {
                    CandidateExamSessionQuestionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateExamSessionId = table.Column<int>(type: "int", nullable: false),
                    OriginalVacancyQuestionId = table.Column<int>(type: "int", nullable: false),
                    OriginalQuestionVersion = table.Column<int>(type: "int", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    OriginalOrder = table.Column<int>(type: "int", nullable: false),
                    QuestionType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Marks = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    TimeAllowedMinutes = table.Column<int>(type: "int", nullable: true),
                    ProgrammingLanguage = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SqlSchema = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MaxWordCount = table.Column<int>(type: "int", nullable: true),
                    QuestionSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateExamSessionQuestions", x => x.CandidateExamSessionQuestionId);
                    table.ForeignKey(
                        name: "FK_CandidateExamSessionQuestions_CandidateExamSessions_CandidateExamSessionId",
                        column: x => x.CandidateExamSessionId,
                        principalSchema: "exam",
                        principalTable: "CandidateExamSessions",
                        principalColumn: "CandidateExamSessionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CandidateExamSessionQuestions_VacancyQuestions_OriginalVacancyQuestionId",
                        column: x => x.OriginalVacancyQuestionId,
                        principalSchema: "question",
                        principalTable: "VacancyQuestions",
                        principalColumn: "VacancyQuestionId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CandidateExamAnswers",
                schema: "exam",
                columns: table => new
                {
                    CandidateExamAnswerId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateExamSessionId = table.Column<int>(type: "int", nullable: false),
                    CandidateExamSessionQuestionId = table.Column<int>(type: "int", nullable: false),
                    Marks = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    SubmittedAnswerText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MarksObtained = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    EvaluationStatus = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false, defaultValue: "Pending"),
                    EvaluationLocked = table.Column<bool>(type: "bit", nullable: false),
                    EvaluatorRemarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EvaluatedById = table.Column<int>(type: "int", nullable: true),
                    EvaluatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AnsweredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateExamAnswers", x => x.CandidateExamAnswerId);
                    table.ForeignKey(
                        name: "FK_CandidateExamAnswers_CandidateExamSessionQuestions_CandidateExamSessionQuestionId",
                        column: x => x.CandidateExamSessionQuestionId,
                        principalSchema: "exam",
                        principalTable: "CandidateExamSessionQuestions",
                        principalColumn: "CandidateExamSessionQuestionId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CandidateExamAnswers_CandidateExamSessions_CandidateExamSessionId",
                        column: x => x.CandidateExamSessionId,
                        principalSchema: "exam",
                        principalTable: "CandidateExamSessions",
                        principalColumn: "CandidateExamSessionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CandidateExamAnswers_Users_EvaluatedById",
                        column: x => x.EvaluatedById,
                        principalSchema: "staff",
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CandidateExamSessionQuestionOptions",
                schema: "exam",
                columns: table => new
                {
                    CandidateExamSessionQuestionOptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateExamSessionQuestionId = table.Column<int>(type: "int", nullable: false),
                    OriginalVacancyQuestionOptionId = table.Column<int>(type: "int", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    OriginalOrder = table.Column<int>(type: "int", nullable: false),
                    DisplayOptionLabel = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
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
                    table.PrimaryKey("PK_CandidateExamSessionQuestionOptions", x => x.CandidateExamSessionQuestionOptionId);
                    table.ForeignKey(
                        name: "FK_CandidateExamSessionQuestionOptions_CandidateExamSessionQuestions_CandidateExamSessionQuestionId",
                        column: x => x.CandidateExamSessionQuestionId,
                        principalSchema: "exam",
                        principalTable: "CandidateExamSessionQuestions",
                        principalColumn: "CandidateExamSessionQuestionId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CandidateExamSessionQuestionOptions_VacancyQuestionOptions_OriginalVacancyQuestionOptionId",
                        column: x => x.OriginalVacancyQuestionOptionId,
                        principalSchema: "question",
                        principalTable: "VacancyQuestionOptions",
                        principalColumn: "VacancyQuestionOptionId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CandidateExamAnswerOptions",
                schema: "exam",
                columns: table => new
                {
                    CandidateExamAnswerOptionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CandidateExamAnswerId = table.Column<int>(type: "int", nullable: false),
                    CandidateExamSessionQuestionOptionId = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "varbinary(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateExamAnswerOptions", x => x.CandidateExamAnswerOptionId);
                    table.ForeignKey(
                        name: "FK_CandidateExamAnswerOptions_CandidateExamAnswers_CandidateExamAnswerId",
                        column: x => x.CandidateExamAnswerId,
                        principalSchema: "exam",
                        principalTable: "CandidateExamAnswers",
                        principalColumn: "CandidateExamAnswerId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CandidateExamAnswerOptions_CandidateExamSessionQuestionOptions_CandidateExamSessionQuestionOptionId",
                        column: x => x.CandidateExamSessionQuestionOptionId,
                        principalSchema: "exam",
                        principalTable: "CandidateExamSessionQuestionOptions",
                        principalColumn: "CandidateExamSessionQuestionOptionId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamAnswerOptions_CandidateExamAnswerId_CandidateExamSessionQuestionOptionId",
                schema: "exam",
                table: "CandidateExamAnswerOptions",
                columns: new[] { "CandidateExamAnswerId", "CandidateExamSessionQuestionOptionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamAnswerOptions_CandidateExamSessionQuestionOptionId",
                schema: "exam",
                table: "CandidateExamAnswerOptions",
                column: "CandidateExamSessionQuestionOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamAnswers_CandidateExamSessionId_CandidateExamSessionQuestionId",
                schema: "exam",
                table: "CandidateExamAnswers",
                columns: new[] { "CandidateExamSessionId", "CandidateExamSessionQuestionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamAnswers_CandidateExamSessionQuestionId",
                schema: "exam",
                table: "CandidateExamAnswers",
                column: "CandidateExamSessionQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamAnswers_EvaluatedById",
                schema: "exam",
                table: "CandidateExamAnswers",
                column: "EvaluatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamSessionQuestionOptions_CandidateExamSessionQuestionId",
                schema: "exam",
                table: "CandidateExamSessionQuestionOptions",
                column: "CandidateExamSessionQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamSessionQuestionOptions_OriginalVacancyQuestionOptionId",
                schema: "exam",
                table: "CandidateExamSessionQuestionOptions",
                column: "OriginalVacancyQuestionOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamSessionQuestions_CandidateExamSessionId_DisplayOrder",
                schema: "exam",
                table: "CandidateExamSessionQuestions",
                columns: new[] { "CandidateExamSessionId", "DisplayOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamSessionQuestions_OriginalVacancyQuestionId",
                schema: "exam",
                table: "CandidateExamSessionQuestions",
                column: "OriginalVacancyQuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamSessions_CandidateId",
                schema: "exam",
                table: "CandidateExamSessions",
                column: "CandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamSessions_CandidatePipelineProgressId",
                schema: "exam",
                table: "CandidateExamSessions",
                column: "CandidatePipelineProgressId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamSessions_EvaluatorId",
                schema: "exam",
                table: "CandidateExamSessions",
                column: "EvaluatorId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamSessions_SessionToken",
                schema: "exam",
                table: "CandidateExamSessions",
                column: "SessionToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamSessions_VacancyId",
                schema: "exam",
                table: "CandidateExamSessions",
                column: "VacancyId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateExamSessions_VacancyQuestionPaperId",
                schema: "exam",
                table: "CandidateExamSessions",
                column: "VacancyQuestionPaperId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CandidateExamAnswerOptions",
                schema: "exam");

            migrationBuilder.DropTable(
                name: "CandidateExamAnswers",
                schema: "exam");

            migrationBuilder.DropTable(
                name: "CandidateExamSessionQuestionOptions",
                schema: "exam");

            migrationBuilder.DropTable(
                name: "CandidateExamSessionQuestions",
                schema: "exam");

            migrationBuilder.DropTable(
                name: "CandidateExamSessions",
                schema: "exam");

            migrationBuilder.DropColumn(
                name: "ExamPasscodeHash",
                schema: "candidate",
                table: "Candidates");
        }
    }
}
