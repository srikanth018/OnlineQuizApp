using QuizApp.DTOs;
using QuizApp.Misc;
using QuizApp.Models;

namespace QuizApp.Mappers
{
    public static class TeacherMappers
    {
        public static Teacher CreateTeacher(CreateTeacherRequestDTO teacherRequest)
        {
            var teacher = new Teacher
            {
                Id = Generators.GenerateID("TE"),
                Name = teacherRequest.Name,
                Email = teacherRequest.Email,
                PhoneNumber = teacherRequest.PhoneNumber,
                Status = "Active",
                User = new User
                {
                    Email = teacherRequest.Email,
                    Password = Generators.GenerateHashedPassword(teacherRequest.Password),
                    Role = "Teacher",
                    CreatedAt = DateTime.UtcNow
                },
                CreatedAt = DateTime.UtcNow
            };
            return teacher;
        }
        public static Teacher TeacherUpdate(TeacherUpdateRequestDTO request)
        {
            Teacher teacher = new();
            if (request.Name is not null)
                teacher.Name = request.Name;
            if (request.Email is not null)
                teacher.Email = request.Email;
            if (request.PhoneNumber is not null)
                teacher.PhoneNumber = request.PhoneNumber;
            if (request.Status is not null)
                teacher.Status = request.Status;
            return teacher;
        }
    }
}