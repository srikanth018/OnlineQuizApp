using Microsoft.EntityFrameworkCore;
using QuizApp.Contexts;
using QuizApp.Models;

namespace QuizApp.Repositories
{
    public class OptionRepository : Repository<string, Option>
    {
        public OptionRepository(QuizAppContext quizAppContext) : base(quizAppContext)
        {
        }

        public override async Task<ICollection<Option>> GetAll()
        {
            return await _quizAppContext.Options.ToListAsync();
        }

        public override async Task<Option> GetById(string key)
        {
            var option = await _quizAppContext.Options.FirstOrDefaultAsync(o => o.Id == key);
            if (option == null) throw new Exception("Option not found with the key");
            return option;
        }
    }
}