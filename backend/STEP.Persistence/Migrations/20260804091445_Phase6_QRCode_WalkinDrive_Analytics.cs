using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STEP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase6_QRCode_WalkinDrive_Analytics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "qr");

            migrationBuilder.AddColumn<int>(
                name: "QRCodeId",
                schema: "candidate",
                table: "Candidates",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "QRCodes",
                schema: "qr",
                columns: table => new
                {
                    QRCodeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VacancyId = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    RegistrationUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    VenueName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    VenueAddress = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    DriveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DriveStartTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    DriveEndTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    Capacity = table.Column<int>(type: "int", nullable: true),
                    RegistrationDeadline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Active"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QRCodes", x => x.QRCodeId);
                    table.ForeignKey(
                        name: "FK_QRCodes_Vacancies_VacancyId",
                        column: x => x.VacancyId,
                        principalSchema: "vacancy",
                        principalTable: "Vacancies",
                        principalColumn: "VacancyId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "QRScanAnalytics",
                schema: "qr",
                columns: table => new
                {
                    QRScanAnalyticId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QRCodeId = table.Column<int>(type: "int", nullable: false),
                    ScannedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ResultedInRegistration = table.Column<bool>(type: "bit", nullable: false),
                    CandidateId = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QRScanAnalytics", x => x.QRScanAnalyticId);
                    table.ForeignKey(
                        name: "FK_QRScanAnalytics_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalSchema: "candidate",
                        principalTable: "Candidates",
                        principalColumn: "CandidateId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_QRScanAnalytics_QRCodes_QRCodeId",
                        column: x => x.QRCodeId,
                        principalSchema: "qr",
                        principalTable: "QRCodes",
                        principalColumn: "QRCodeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_QRCodeId",
                schema: "candidate",
                table: "Candidates",
                column: "QRCodeId");

            migrationBuilder.CreateIndex(
                name: "IX_QRCodes_Code",
                schema: "qr",
                table: "QRCodes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QRCodes_VacancyId",
                schema: "qr",
                table: "QRCodes",
                column: "VacancyId");

            migrationBuilder.CreateIndex(
                name: "IX_QRScanAnalytics_CandidateId",
                schema: "qr",
                table: "QRScanAnalytics",
                column: "CandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_QRScanAnalytics_QRCodeId",
                schema: "qr",
                table: "QRScanAnalytics",
                column: "QRCodeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Candidates_QRCodes_QRCodeId",
                schema: "candidate",
                table: "Candidates",
                column: "QRCodeId",
                principalSchema: "qr",
                principalTable: "QRCodes",
                principalColumn: "QRCodeId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Candidates_QRCodes_QRCodeId",
                schema: "candidate",
                table: "Candidates");

            migrationBuilder.DropTable(
                name: "QRScanAnalytics",
                schema: "qr");

            migrationBuilder.DropTable(
                name: "QRCodes",
                schema: "qr");

            migrationBuilder.DropIndex(
                name: "IX_Candidates_QRCodeId",
                schema: "candidate",
                table: "Candidates");

            migrationBuilder.DropColumn(
                name: "QRCodeId",
                schema: "candidate",
                table: "Candidates");
        }
    }
}
