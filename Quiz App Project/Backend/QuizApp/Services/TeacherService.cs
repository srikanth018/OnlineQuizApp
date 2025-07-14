using QuizApp.DTOs;
using QuizApp.Interfaces;
using QuizApp.Mappers;
using QuizApp.Models;

namespace QuizApp.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly IRepository<string, Teacher> _teacherRepository;
        private readonly IRepository<string, User> _userRepository;
 

        public TeacherService(IRepository<string, Teacher> teacherRepository, IRepository<string, User> userRepository)
        {
            _teacherRepository = teacherRepository;
            _userRepository = userRepository;

        }
        public async Task<Teacher> CreateTeacherAsync(CreateTeacherRequestDTO teacher)
        {
            

            var newTeacher = TeacherMappers.CreateTeacher(teacher);
            var newUser = newTeacher.User;
            if (newUser == null)
            {
                throw new InvalidOperationException("User data of the new teacher is null.");
            }
            newUser.Teacher = newTeacher;
            await _userRepository.Add(newUser);
            newTeacher.User = null;
            await _teacherRepository.Add(newTeacher);
            newTeacher.User = newUser;
            return newTeacher;
        }

        public async Task<Teacher> DeleteTeacherAsync(string id)
        {
            var deleteTeacher = await _teacherRepository.GetById(id);
            if (deleteTeacher == null)
            {
                throw new KeyNotFoundException($"Teacher not found with the provided id - {id} for delete");
            }
            return await _teacherRepository.Delete(deleteTeacher);
        }

        public async Task<IEnumerable<Teacher>> FilterTeachers(string? search, string? status, int pageNumber, int pageSize)
        {
            var teachers = await _teacherRepository.GetAll();
            var filtered = teachers
                .Where(teacher =>
                {
                    bool matchesSearch = string.IsNullOrEmpty(search) || teacher.Name.Contains(search, StringComparison.OrdinalIgnoreCase) || teacher.Email.Contains(search, StringComparison.OrdinalIgnoreCase) || teacher.PhoneNumber.Contains(search, StringComparison.OrdinalIgnoreCase);
                    bool matchesStatus = string.IsNullOrEmpty(status) || teacher.Status.Equals(status, StringComparison.OrdinalIgnoreCase);
                    return matchesSearch && matchesStatus;
                })
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
            return filtered;
        }
        public async Task<IEnumerable<Teacher>> SortTeachers(string sortBy, int pageNumber, int pageSize, bool ascending = true)
        {
            var teachers = await _teacherRepository.GetAll();
            return ascending
                ? teachers.OrderBy(t => t.GetType().GetProperty(sortBy)?.GetValue(t, null))
                : teachers.OrderByDescending(t => t.GetType().GetProperty(sortBy)?.GetValue(t, null))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
        }

        public async Task<IEnumerable<Teacher>> GetAllTeachersAsync()
        {
            return await _teacherRepository.GetAll();
        }

        public async Task<Teacher> GetByEmailAsync(string email)
        {
            var teachers = await _teacherRepository.GetAll();
            var teacher = teachers.FirstOrDefault(t => t.Email == email);
            if (teacher == null)
            {
                throw new KeyNotFoundException($"Teacher with email {email} not found.");
            }
            return teacher;
        }

        public async Task<Teacher?> GetTeacherByIdAsync(string id)
        {
            return await _teacherRepository.GetById(id);
        }

        public async Task<Teacher> UpdateTeacherAsync(string id, TeacherUpdateRequestDTO dto)
        {
            var teacher = await _teacherRepository.GetById(id);
            if (teacher == null)
                throw new KeyNotFoundException("Teacher not found");

            if (!string.IsNullOrEmpty(dto.Name))
                teacher.Name = dto.Name;

            if (!string.IsNullOrEmpty(dto.Email))
                teacher.Email = dto.Email;

            if (!string.IsNullOrEmpty(dto.PhoneNumber))
                teacher.PhoneNumber = dto.PhoneNumber;

            if (!string.IsNullOrEmpty(dto.Status))
                teacher.Status = dto.Status;

            await _teacherRepository.Update(id, teacher);
            return teacher;
        }

    }
}