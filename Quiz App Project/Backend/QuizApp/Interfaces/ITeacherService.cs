using QuizApp.DTOs;
using QuizApp.Models;

namespace QuizApp.Interfaces
{
    public interface ITeacherService
    {
        Task<Teacher> CreateTeacherAsync(CreateTeacherRequestDTO teacher);
        Task<Teacher?> GetTeacherByIdAsync(string id);
        Task<IEnumerable<Teacher>> GetAllTeachersAsync();
        Task<Teacher> UpdateTeacherAsync(string id, TeacherUpdateRequestDTO teacher);
        Task<Teacher> DeleteTeacherAsync(string id);
        Task<Teacher> GetByEmailAsync(string email);
        Task<IEnumerable<Teacher>> FilterTeachers(string? search, string? status, int pageNumber, int pageSize);
        Task<IEnumerable<Teacher>> SortTeachers(string sortBy, int pageNumber, int pageSize, bool ascending = true);
    }
}