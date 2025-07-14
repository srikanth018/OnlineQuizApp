using QuizApp.DTOs;
using QuizApp.Misc;
using QuizApp.Models;

namespace QuizApp.Mappers
{
    public static class StudentMappers
    {
public static Student CreateStudentMapper(CreateStudentRequestDTO request)
{
    return new Student
    {
        Id = Generators.GenerateID("ST"),
        Name = request.Name,
        Email = request.Email,
        PhoneNumber = request.PhoneNumber,
        DateOfBirth = request.DateOfBirth, 
        HighestQualification = request.HighestQualification,
        Status = "Active",
        User = new User
        {
            Email = request.Email,
            Role = "Student",
            Password = Generators.GenerateHashedPassword(request.Password),
            CreatedAt = DateTime.UtcNow 
        },
        CreatedAt = DateTime.UtcNow
    };
}

        public static Student StudentUpdateMApper(StudentUpdateRequestDto request)
        {
            Student student = new();
            if (request.Name is not null)
                student.Name = request.Name;

            if (request.PhoneNumber is not null)
                student.PhoneNumber = request.PhoneNumber;

            if (request.DateOfBirth.HasValue)
                student.DateOfBirth = request.DateOfBirth.Value;

            if (request.HighestQualification is not null)
                student.HighestQualification = request.HighestQualification;

            if (request.Status is not null)
                student.Status = request.Status;

            return student;
        }
    }
}
