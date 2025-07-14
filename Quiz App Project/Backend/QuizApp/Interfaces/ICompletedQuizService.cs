using QuizApp.DTOs;
using QuizApp.Models;

namespace QuizApp.Interfaces
{
    public interface ICompletedQuizService
    {
        Task<ICollection<CompletedQuiz>> GetAllCompletedQuizzesAsync();
        Task<CompletedQuiz?> GetCompletedQuizByIdAsync(string id);
        Task<ICollection<CompletedQuiz>> GetCompletedQuizzesByStudentEmailAsync(string studentEmail);
        Task<ICollection<CompletedQuiz>> GetCompletedQuizByQuizIdAsync(string quizId);
    }
}
