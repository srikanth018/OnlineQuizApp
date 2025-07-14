using Microsoft.EntityFrameworkCore;
using QuizApp.Contexts;
using QuizApp.Models;

namespace QuizApp.Repositories
{
    public class QuestionRepository : Repository<string, Question>
    {
        public QuestionRepository(QuizAppContext quizAppContext) : base(quizAppContext)
        {
        }

        public override async Task<ICollection<Question>> GetAll()
        {
            return await _quizAppContext.Questions.ToListAsync();
        }

        public override async Task<Question> GetById(string key)
        {
            var question = await _quizAppContext.Questions.FirstOrDefaultAsync(q => q.Id == key);
            if (question == null) throw new Exception("Question not found with the key");
            return question;
        }
    }
}