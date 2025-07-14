using Microsoft.EntityFrameworkCore;
using QuizApp.Contexts;
using QuizApp.Models;

namespace QuizApp.Repositories
{
    public class CompletedQuizRepository : Repository<string, CompletedQuiz>
    {
        public CompletedQuizRepository(QuizAppContext quizAppContext) : base(quizAppContext)
        {
        }

        public override async Task<ICollection<CompletedQuiz>> GetAll()
        {
            return await _quizAppContext.CompletedQuizzes.ToListAsync();
        }

        public override async Task<CompletedQuiz> GetById(string key)
        {
            var completedQuiz = await _quizAppContext.CompletedQuizzes.FirstOrDefaultAsync(cq => cq.Id == key);
            if (completedQuiz == null) throw new Exception("Completed quiz not found with the key");
            return completedQuiz;

        }
    }
}