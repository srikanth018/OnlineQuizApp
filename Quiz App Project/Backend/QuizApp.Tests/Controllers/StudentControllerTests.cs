using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using QuizApp.Controllers.v1;
using QuizApp.DTOs;
using QuizApp.Interfaces;
using QuizApp.Models;
using Xunit;

namespace QuizApp.Tests.Controllers
{
    public class StudentControllerTests
    {
        private readonly Mock<IStudentService> _mockStudentService;
        private readonly StudentController _controller;

        public StudentControllerTests()
        {
            _mockStudentService = new Mock<IStudentService>();
            _controller = new StudentController(_mockStudentService.Object);
        }

        [Fact]
        public async Task CreateStudent_ShouldReturnCreatedAtActionResult()
        {
            // Arrange
            var createDto = new CreateStudentRequestDTO
            {
                Name = "Test Student",
                Email = "test@student.com",
                PhoneNumber = "1234567890",
                Password = "Test@123"
            };

            var createdStudent = new Student
            {
                Id = Guid.NewGuid().ToString(),
                Name = createDto.Name,
                Email = createDto.Email
            };

            _mockStudentService.Setup(s => s.CreateStudentAsync(createDto))
                               .ReturnsAsync(createdStudent);

            // Act
            var result = await _controller.CreateStudent(createDto);

            // Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(StudentController.GetStudentById), actionResult.ActionName);
            Assert.Equal(createdStudent.Id, ((Student)actionResult.Value!).Id);
        }

        [Fact]
        public async Task GetStudentById_ShouldReturnOk_WhenStudentExists()
        {
            var studentId = "1";
            var student = new Student { Id = studentId, Name = "Student 1" };

            _mockStudentService.Setup(s => s.GetStudentByIdAsync(studentId)).ReturnsAsync(student);

            var result = await _controller.GetStudentById(studentId);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(student, okResult.Value);
        }

        [Fact]
        public async Task GetStudentById_ShouldReturnNotFound_WhenStudentDoesNotExist()
        {
            _mockStudentService.Setup(s => s.GetStudentByIdAsync("non-existent")).ReturnsAsync((Student)null!);

            var result = await _controller.GetStudentById("non-existent");

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("No student found", notFound.Value!.ToString());
        }

        [Fact]
        public async Task GetStudentByEmail_ShouldReturnOk_WhenStudentExists()
        {
            var email = "student1@example.com";
            var student = new Student { Email = email, Name = "Student 1" };

            _mockStudentService.Setup(s => s.GetByEmailAsync(email)).ReturnsAsync(student);

            var result = await _controller.GetStudentByEmail(email);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(student, okResult.Value);
        }

        [Fact]
        public async Task GetStudentByEmail_ShouldReturnNotFound_WhenStudentDoesNotExist()
        {
            _mockStudentService.Setup(s => s.GetByEmailAsync("missing@example.com"))
                               .ThrowsAsync(new InvalidOperationException("Student not found"));

            var result = await _controller.GetStudentByEmail("missing@example.com");

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Student not found", notFoundResult.Value!.ToString());
        }

        [Fact]
        public async Task UpdateStudent_ShouldReturnOk_WhenUpdatedSuccessfully()
        {
            var studentId = "1";
            var updateDto = new StudentUpdateRequestDto { Name = "Updated Name" };
            var updatedStudent = new Student { Id = studentId, Name = updateDto.Name };

            _mockStudentService.Setup(s => s.UpdateStudentAsync(studentId, updateDto))
                               .ReturnsAsync(updatedStudent);

            var result = await _controller.UpdateStudent(studentId, updateDto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(updatedStudent, okResult.Value);
        }

        [Fact]
        public async Task UpdateStudent_ShouldReturnNotFound_WhenStudentNotFound()
        {
            var studentId = "missing";
            var updateDto = new StudentUpdateRequestDto { Name = "Updated Name" };

            _mockStudentService.Setup(s => s.UpdateStudentAsync(studentId, updateDto))
                               .ThrowsAsync(new KeyNotFoundException("Student not found"));

            var result = await _controller.UpdateStudent(studentId, updateDto);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Student not found", notFound.Value!.ToString());
        }

        [Fact]
        public async Task FilterStudents_ShouldReturnOkResult()
        {
            var students = new List<Student> { new Student { Id = "1", Name = "Student 1" } };
            _mockStudentService.Setup(s => s.FilterStudents(null, null, 1, 10)).ReturnsAsync(students);

            var result = await _controller.FilterStudents();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(students, okResult.Value);
        }

        [Fact]
        public async Task SortStudents_ShouldReturnOkResult()
        {
            var students = new List<Student> { new Student { Id = "1", Name = "Student 1" } };
            _mockStudentService.Setup(s => s.SortStudents("Name", 1, 10, true)).ReturnsAsync(students);

            var result = await _controller.SortStudents("Name");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(students, okResult.Value);
        }
    }
}
