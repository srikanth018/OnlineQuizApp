using Microsoft.EntityFrameworkCore;
using QuizApp.Contexts;
using QuizApp.Models;

namespace QuizApp.Repositories
{
    public class QuizRepository : Repository<string, Quiz>
    {
        public QuizRepository(QuizAppContext context) : base(context)
        {
        }

        public override async Task<ICollection<Quiz>> GetAll()
        {
            return await _quizAppContext.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(question => question.Options)
                .ToListAsync();
        }

        public override async Task<Quiz> GetById(string key)
        {
            Console.WriteLine($"Looking for Quiz ID: {key}");

            var quiz = await _quizAppContext.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id.Trim() == key.Trim());

            if (quiz == null)
                throw new Exception($"Quiz not found with the key: {key}");

            return quiz;
        }

    }

}