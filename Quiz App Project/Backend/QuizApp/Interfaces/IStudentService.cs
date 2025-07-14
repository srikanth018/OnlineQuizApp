using QuizApp.DTOs;
using QuizApp.Models;

namespace QuizApp.Interfaces
{
    public interface IStudentService
    {
        Task<Student> CreateStudentAsync(CreateStudentRequestDTO student);
        Task<Student?> GetStudentByIdAsync(string id);
        Task<IEnumerable<Student>> GetAllStudentsAsync();
        Task<Student> UpdateStudentAsync(string id, StudentUpdateRequestDto student);
        Task<Student> DeleteStudentAsync(string id);
        Task<Student> GetByEmailAsync(string email);
        Task<IEnumerable<Student>> FilterStudents(string? search, string? status, int pageNumber, int pageSize);
        Task<IEnumerable<Student>> SortStudents(string sortBy, int pageNumber, int pageSize, bool ascending = true);
    }
}