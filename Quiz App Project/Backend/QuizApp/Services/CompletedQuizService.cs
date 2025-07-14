using QuizApp.Interfaces;
using QuizApp.Models;

namespace QuizApp.Services
{
    public class CompletedQuizService : ICompletedQuizService
    {
        private readonly IRepository<string, CompletedQuiz> _completedQuizRepo;

        public CompletedQuizService(IRepository<string, CompletedQuiz> completedQuizRepo)
        {
            _completedQuizRepo = completedQuizRepo;
        }

        public async Task<ICollection<CompletedQuiz>> GetCompletedQuizByQuizIdAsync(string quizId)
        {
            var completedQuizzes = await _completedQuizRepo.GetAll();
            var completedQuizzesById = completedQuizzes.Where(q => q.QuizId == quizId);
            if (!completedQuizzesById.Any())
            {
                throw new KeyNotFoundException($"No completed quiz found for quiz id {quizId}");
            }

            return completedQuizzesById.ToList();
        }

        public async Task<ICollection<CompletedQuiz>> GetAllCompletedQuizzesAsync()
        {
            return await _completedQuizRepo.GetAll();
        }

        public async Task<CompletedQuiz?> GetCompletedQuizByIdAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                throw new ArgumentException("Quiz ID cannot be null or empty.", nameof(id));
            }
            return await _completedQuizRepo.GetById(id);
        }

        public async Task<ICollection<CompletedQuiz>> GetCompletedQuizzesByStudentEmailAsync(string studentEmail)
        {
            var quizzes = await _completedQuizRepo.GetAll();
            return quizzes
                .Where(q => q.StudentEmail.Equals(studentEmail, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

    }
}
