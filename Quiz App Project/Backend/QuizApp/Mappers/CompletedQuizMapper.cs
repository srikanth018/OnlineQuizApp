using QuizApp.DTOs;
using QuizApp.Misc;
using QuizApp.Models;

namespace QuizApp.Mappers
{
    public static class CompletedQuizMapper
    {
        public static CompletedQuiz MapToCompletedQuiz(SubmitQuizRequestDTO request, int totalMarksSecured)
        {
            if (request == null)
                throw new ArgumentNullException("Request or Quiz cannot be null");

            return new CompletedQuiz
            {
                Id = Generators.GenerateID("CQ"),
                QuizId = request.QuizId,
                StudentEmail = request.StudentEmail,
                TotalScore = totalMarksSecured,
                CreatedAt = DateTime.UtcNow,
                StartedAt = request.StartedAt,
                EndedAt = request.EndedAt,

            };
        }
    }
}