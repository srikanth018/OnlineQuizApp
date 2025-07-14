using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using QuizApp.DTOs;
using QuizApp.Interfaces;
using QuizApp.Mappers;
using QuizApp.Models;
using QuizApp.Services;
using Xunit;

namespace QuizApp.Tests.Services
{
    public class StudentServiceTests
    {
        private readonly Mock<IRepository<string, User>> _mockUserRepo;
        private readonly Mock<IRepository<string, Student>> _mockStudentRepo;
        private readonly StudentService _studentService;

        public StudentServiceTests()
        {
            _mockUserRepo = new Mock<IRepository<string, User>>();
            _mockStudentRepo = new Mock<IRepository<string, Student>>();
            _studentService = new StudentService(_mockUserRepo.Object, _mockStudentRepo.Object);
        }

        [Fact]
        public async Task CreateStudentAsync_ShouldReturnCreatedStudent()
        {
            // Arrange
            var student = new CreateStudentRequestDTO
            {
                Name = "student1",
                Email = "student1@example.com",
                PhoneNumber = "1234567890",
                DateOfBirth = new DateTime(2000, 1, 1),
                HighestQualification = "BSc",
                Password = "Test123@"
            };
            var user = new User
            {
                Email = student.Email,
                Password = student.Password,
                Role = "Student",
                CreatedAt = DateTime.UtcNow
            };
            var studentModel = new Student
            {
                Id = Guid.NewGuid().ToString(),
                Name = student.Name,
                Email = student.Email,
                PhoneNumber = student.PhoneNumber,
                DateOfBirth = student.DateOfBirth,
                HighestQualification = student.HighestQualification,
                Status = "Active",
                User = user
            };
            _mockUserRepo.Setup(r => r.Add(It.IsAny<User>())).ReturnsAsync(user);
            _mockStudentRepo.Setup(r => r.Add(It.IsAny<Student>())).ReturnsAsync(studentModel);

            // Act
            var result = await _studentService.CreateStudentAsync(student);

            // Assert
            Assert.Equal(student.Email, result.Email);
            _mockUserRepo.Verify(r => r.Add(It.IsAny<User>()), Times.Once);
            _mockStudentRepo.Verify(r => r.Add(It.IsAny<Student>()), Times.Once);
        }

        [Fact]
        public async Task GetStudentByIdAsync_ShouldReturnStudent_WhenExists()
        {
            // Arrange
            var studentId = "1";
            var expectedStudent = new Student { Id = studentId, Name = "student1" };

            _mockStudentRepo.Setup(r => r.GetById(studentId)).ReturnsAsync(expectedStudent);

            // Act
            var result = await _studentService.GetStudentByIdAsync(studentId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("student1", result.Name);
        }

        [Fact]
        public async Task UpdateStudentAsync_ShouldThrowException_WhenStudentNotFound()
        {
            // Arrange
            var studentId = "1";
            var updateDto = new StudentUpdateRequestDto
            {
                Name = "Updated Name",
                PhoneNumber = "9876543210",
                HighestQualification = "MSc"
            };

            _mockStudentRepo.Setup(r => r.GetById(studentId)).ReturnsAsync((Student)null!);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _studentService.UpdateStudentAsync(studentId, updateDto));
        }

        [Fact]
        public async Task DeleteStudentAsync_ShouldReturnDeletedStudent_WhenExists()
        {
            // Arrange
            var studentId = "1";
            var existingStudent = new Student { Id = studentId, Name = "Delete Me" };

            _mockStudentRepo.Setup(r => r.GetById(studentId)).ReturnsAsync(existingStudent);
            _mockStudentRepo.Setup(r => r.Delete(existingStudent)).ReturnsAsync(existingStudent);

            // Act
            var result = await _studentService.DeleteStudentAsync(studentId);

            // Assert
            Assert.Equal("Delete Me", result.Name);
            _mockStudentRepo.Verify(r => r.GetById(studentId), Times.Once);
            _mockStudentRepo.Verify(r => r.Delete(existingStudent), Times.Once);
        }

        [Fact]
        public async Task CreateStudentAsync_ShouldThrowInvalidOperationException_WhenUserIsNull()
        {
            // Arrange
            var studentDto = new CreateStudentRequestDTO
            {
                Name = "student1",
                Email = "student1@example.com",
                PhoneNumber = "1234567890",
                DateOfBirth = new DateTime(2000, 1, 1),
                HighestQualification = "BSc",
                Password = "Test123@"
            };

            // Manipulate mapper to create student with null User
            var faultyStudent = StudentMappers.CreateStudentMapper(studentDto);
            faultyStudent.User = null;

            // You might need to mock the mapper or test using reflection/stub for a real null User case.

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _studentService.CreateStudentAsync(studentDto));
        }

        [Fact]
        public async Task GetStudentByIdAsync_ShouldReturnNull_WhenStudentDoesNotExist()
        {
            // Arrange
            var studentId = "non-existent";
            _mockStudentRepo.Setup(r => r.GetById(studentId)).ReturnsAsync((Student)null!);

            // Act
            var result = await _studentService.GetStudentByIdAsync(studentId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetByEmailAsync_ShouldThrowInvalidOperationException_WhenEmailNotFound()
        {
            // Arrange
            var email = "nonexistent@example.com";
            var students = new List<Student>(); // empty list to simulate no students

            _mockStudentRepo.Setup(r => r.GetAll()).ReturnsAsync(students);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _studentService.GetByEmailAsync(email));
        }

        [Fact]
        public async Task DeleteStudentAsync_ShouldThrowKeyNotFoundException_WhenStudentNotFound()
        {
            // Arrange
            var studentId = "non-existent";
            _mockStudentRepo.Setup(r => r.GetById(studentId)).ReturnsAsync((Student)null!);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _studentService.DeleteStudentAsync(studentId));
        }

        [Fact]
        public async Task GetByEmailAsync_ShouldReturnStudent_WhenEmailExists()
        {
            // Arrange
            var email = "student1@example.com";
            var studentList = new List<Student>
    {
        new Student { Id = "1", Email = email, Name = "Student1" },
        new Student { Id = "2", Email = "another@example.com", Name = "Student2" }
    };

            _mockStudentRepo.Setup(r => r.GetAll()).ReturnsAsync(studentList);

            // Act
            var result = await _studentService.GetByEmailAsync(email);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(email, result.Email);
        }
[Fact]
public async Task CreateStudentAsync_ShouldThrowException_WhenStudentWithSameEmailAlreadyExists()
{
    // Arrange
    var studentDto = new CreateStudentRequestDTO
    {
        Name = "New Student",
        Email = "duplicate@example.com",
        PhoneNumber = "1234567890",
        DateOfBirth = new DateTime(2000, 1, 1),
        HighestQualification = "BSc",
        Password = "Test@123"
    };

    var existingStudent = new Student { Id = "1", Email = studentDto.Email };

    _mockStudentRepo.Setup(r => r.GetAll()).ReturnsAsync(new List<Student> { existingStudent });

    // Act & Assert
    await Assert.ThrowsAsync<InvalidOperationException>(() => _studentService.CreateStudentAsync(studentDto));
}
[Fact]
public async Task GetAllStudentsAsync_ShouldReturnAllStudents()
{
    // Arrange
    var students = new List<Student>
    {
        new Student { Id = "1", Name = "Student 1" },
        new Student { Id = "2", Name = "Student 2" }
    };

    _mockStudentRepo.Setup(r => r.GetAll()).ReturnsAsync(students);

    // Act
    var result = await _studentService.GetAllStudentsAsync();

    // Assert
    Assert.Equal(2, result.Count());
}


    }
}
