using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizApp.Migrations
{
    /// <inheritdoc />
    public partial class ColumnUpdates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CompletedQuiz_Student",
                table: "CompletedQuizzes");

            migrationBuilder.DropIndex(
                name: "IX_Students_Email",
                table: "Students");

            migrationBuilder.RenameColumn(
                name: "StudentId",
                table: "CompletedQuizzes",
                newName: "StudentEmail");

            migrationBuilder.RenameIndex(
                name: "IX_CompletedQuizzes_StudentId",
                table: "CompletedQuizzes",
                newName: "IX_CompletedQuizzes_StudentEmail");

            migrationBuilder.AddColumn<string>(
                name: "QuizId",
                table: "CompletedQuizzes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Students_Email",
                table: "Students",
                column: "Email");

            migrationBuilder.AddForeignKey(
                name: "FK_CompletedQuiz_Student",
                table: "CompletedQuizzes",
                column: "StudentEmail",
                principalTable: "Students",
                principalColumn: "Email",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CompletedQuiz_Student",
                table: "CompletedQuizzes");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Students_Email",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "QuizId",
                table: "CompletedQuizzes");

            migrationBuilder.RenameColumn(
                name: "StudentEmail",
                table: "CompletedQuizzes",
                newName: "StudentId");

            migrationBuilder.RenameIndex(
                name: "IX_CompletedQuizzes_StudentEmail",
                table: "CompletedQuizzes",
                newName: "IX_CompletedQuizzes_StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Students_Email",
                table: "Students",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CompletedQuiz_Student",
                table: "CompletedQuizzes",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
