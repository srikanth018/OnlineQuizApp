using Microsoft.EntityFrameworkCore;
using QuizApp.Contexts;
using QuizApp.Models;

namespace QuizApp.Repositories
{
    public class TeacherRepository : Repository<string, Teacher>
    {
        public TeacherRepository(QuizAppContext quizAppContext):base(quizAppContext)
        {
            
        }
        public override async Task<ICollection<Teacher>> GetAll()
        {
            return await _quizAppContext.Teachers.ToListAsync();
        }

        public async override Task<Teacher> GetById(string key)
        {
            var teacher = await _quizAppContext.Teachers.FirstOrDefaultAsync(u => u.Id == key);
            if (teacher == null) throw new Exception("Teacher not found with the key");
            return teacher;
        }
    }
}