using Microsoft.EntityFrameworkCore;
using QuizApp.Contexts;
using QuizApp.Models;

namespace QuizApp.Repositories
{
    public class StudentRepository : Repository<string, Student>
    {
        public StudentRepository(QuizAppContext quizAppContext):base(quizAppContext)
        {
            
        }
        public override async Task<ICollection<Student>> GetAll()
        {
            return await _quizAppContext.Students.ToListAsync();
        }

        public override async Task<Student> GetById(string key)
        {
            var student = await _quizAppContext.Students.FirstOrDefaultAsync(u => u.Id == key);
            if (student == null) throw new Exception("Student not found with the key");
            return student;
        }
    }
}