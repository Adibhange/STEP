using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace STEP.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase9_AssignedInterviewer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Note: `dotnet ef migrations add` also scaffolded a diff against RolePermissions/
            // Users.PasswordHash seed rows — that's stale-snapshot noise from IdentitySeedData's
            // non-deterministic HasData() (BCrypt salts a fresh hash on every build, and the seed
            // loop's grant-id assignment isn't stable across builds either). Deliberately excluded
            // here — this migration should only ever be the real, additive schema change below.
            migrationBuilder.AddColumn<int>(
                name: "InterviewerUserId",
                schema: "interview",
                table: "Interviews",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_InterviewerUserId",
                schema: "interview",
                table: "Interviews",
                column: "InterviewerUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Interviews_Users_InterviewerUserId",
                schema: "interview",
                table: "Interviews",
                column: "InterviewerUserId",
                principalSchema: "staff",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Interviews_Users_InterviewerUserId",
                schema: "interview",
                table: "Interviews");

            migrationBuilder.DropIndex(
                name: "IX_Interviews_InterviewerUserId",
                schema: "interview",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "InterviewerUserId",
                schema: "interview",
                table: "Interviews");
        }
    }
}
