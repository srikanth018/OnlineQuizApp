using QuizApp.DTOs;
using QuizApp.Interfaces;
using QuizApp.Mappers;
using QuizApp.Models;

namespace QuizApp.Services
{
    public class StudentService : IStudentService
    {
        private readonly IRepository<string, User> _userRepository;
        private readonly IRepository<string, Student> _studentRepositry;

        public StudentService(IRepository<string, User> userRepository, IRepository<string, Student> studentRepositry)
        {
            _userRepository = userRepository;
            _studentRepositry = studentRepositry;
        }
        public async Task<Student> CreateStudentAsync(CreateStudentRequestDTO student)
        {
            var newStudent = StudentMappers.CreateStudentMapper(student);
            var newUser = newStudent.User;

            if (newUser == null)
            {
                throw new InvalidOperationException("User data of the new student is null.");
            }

            await _userRepository.Add(newUser);

            var utcDateOfBirth = DateTime.SpecifyKind(student.DateOfBirth.ToUniversalTime(), DateTimeKind.Utc);
            newStudent.DateOfBirth = utcDateOfBirth;

            newStudent.User = null;
            await _studentRepositry.Add(newStudent);

            newStudent.User = newUser;
            return newStudent;
        }


        public async Task<Student> DeleteStudentAsync(string id)
        {
            var deleteStudent = await _studentRepositry.GetById(id);
            if (deleteStudent == null)
            {
                throw new KeyNotFoundException($"student not found with the provided id - {id} for delete");
            }
            return await _studentRepositry.Delete(deleteStudent);
        }

        public async Task<IEnumerable<Student>> GetAllStudentsAsync()
        {
            return await _studentRepositry.GetAll();
        }

        public async Task<Student> GetByEmailAsync(string email)
        {
            var students = await _studentRepositry.GetAll();
            var student = students.FirstOrDefault(s => s.Email == email);
            if (student == null) throw new InvalidOperationException($"Student with this {email} is not available");
            return student;
        }

        public async Task<Student?> GetStudentByIdAsync(string id)
        {
            return await _studentRepositry.GetById(id);
        }

        public async Task<Student> UpdateStudentAsync(string id, StudentUpdateRequestDto dto)
        {
            var student = await _studentRepositry.GetById(id);
            if (student == null)
            {
                throw new KeyNotFoundException($"Student not found with the provided id - {id} for update");
            }

            student.Name = dto.Name ?? student.Name;
            student.PhoneNumber = dto.PhoneNumber ?? student.PhoneNumber;
            student.HighestQualification = dto.HighestQualification ?? student.HighestQualification;
            student.Status = dto.Status ?? student.Status;

            if (dto.DateOfBirth != null)
            {
                var utcDateOfBirth = DateTime.SpecifyKind(dto.DateOfBirth.Value.ToUniversalTime(), DateTimeKind.Utc);
                student.DateOfBirth = utcDateOfBirth;
            }

            return await _studentRepositry.Update(id, student);
        }

        public async Task<IEnumerable<Student>> FilterStudents(string? search, string? status, int pageNumber, int pageSize)
        {
            var students = await _studentRepositry.GetAll();

            var filtered = students
                .Where(student =>
                {
                    bool matchesSearch = string.IsNullOrEmpty(search)
                        || student.Name.Contains(search, StringComparison.OrdinalIgnoreCase)
                        || student.Email.Contains(search, StringComparison.OrdinalIgnoreCase)
                        || student.PhoneNumber.Contains(search, StringComparison.OrdinalIgnoreCase)
                        || student.HighestQualification.Contains(search, StringComparison.OrdinalIgnoreCase);

                    bool matchesStatus = string.IsNullOrEmpty(status)
                        || student.Status.Equals(status, StringComparison.OrdinalIgnoreCase);

                    return matchesSearch && matchesStatus;
                })
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);

            return filtered;
        }
        public async Task<IEnumerable<Student>> SortStudents(string sortBy, int pageNumber, int pageSize, bool ascending = true)
        {
            var students = await _studentRepositry.GetAll();

            var sortedStudents = ascending
                ? students.OrderBy(s => s.GetType().GetProperty(sortBy)?.GetValue(s, null))
                : students.OrderByDescending(s => s.GetType().GetProperty(sortBy)?.GetValue(s, null));

            return sortedStudents
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
        }

    }
}