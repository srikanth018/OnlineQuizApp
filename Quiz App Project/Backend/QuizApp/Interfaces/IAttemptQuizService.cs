using QuizApp.DTOs;
using QuizApp.Models;

namespace QuizApp.Interfaces
{
    public interface IAttemptQuizService
    {
        Task<AttemptQuizResponseDTO> AttemptQuizAsync(string quizId);
        Task<CompletedQuiz> SubmitQuizAsync(SubmitQuizRequestDTO request);
    }
}