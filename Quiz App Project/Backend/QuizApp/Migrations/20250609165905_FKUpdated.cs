using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizApp.Migrations
{
    /// <inheritdoc />
    public partial class FKUpdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quiz_Teacher",
                table: "Quizzes");

            migrationBuilder.DropIndex(
                name: "IX_Teachers_Email",
                table: "Teachers");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Teacher_Email",
                table: "Teachers",
                column: "Email");

            migrationBuilder.AddForeignKey(
                name: "FK_Quiz_Teacher",
                table: "Quizzes",
                column: "UploadedBy",
                principalTable: "Teachers",
                principalColumn: "Email",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quiz_Teacher",
                table: "Quizzes");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Teacher_Email",
                table: "Teachers");

            migrationBuilder.CreateIndex(
                name: "IX_Teachers_Email",
                table: "Teachers",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Quiz_Teacher",
                table: "Quizzes",
                column: "UploadedBy",
                principalTable: "Teachers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
