using Microsoft.EntityFrameworkCore;
using QuizApp.Contexts;
using QuizApp.Models;

namespace QuizApp.Repositories
{
    public class UserRepository : Repository<string, User>
    {
        public UserRepository(QuizAppContext quizAppContext) : base(quizAppContext)
        {
            
        }
        public override async Task<ICollection<User>> GetAll()
        {
            return await _quizAppContext.Users.ToListAsync();
        }

        public override async Task<User> GetById(string key)
        {
            var user = await _quizAppContext.Users.FirstOrDefaultAsync(u => u.Email == key);
            if (user == null) throw new Exception($"User not found with the key: {key}");
            return user;
        }
    }
}