using Microsoft.AspNetCore.Mvc;
using Moq;
using QuizApp.Controllers.v1;
using QuizApp.DTOs;
using QuizApp.Interfaces;
using QuizApp.Models;
using Xunit;

namespace QuizApp.Tests.Controllers
{
    public class TeacherControllerTests
    {
        private readonly Mock<ITeacherService> _teacherServiceMock;
        private readonly TeacherController _controller;

        public TeacherControllerTests()
        {
            _teacherServiceMock = new Mock<ITeacherService>();
            _controller = new TeacherController(_teacherServiceMock.Object);
        }

        [Fact]
        public async Task CreateTeacher_ReturnsCreatedAtActionResult()
        {
            // Arrange
            var teacherRequest = new CreateTeacherRequestDTO
            {
                Name = "John Doe",
                Email = "john@example.com",
                PhoneNumber = "1234567890",
                Password = "password"
            };

            var teacher = new Teacher
            {
                Id = Guid.NewGuid().ToString(),
                Name = teacherRequest.Name,
                Email = teacherRequest.Email,
                PhoneNumber = teacherRequest.PhoneNumber
            };

            _teacherServiceMock.Setup(s => s.CreateTeacherAsync(teacherRequest))
                .ReturnsAsync(teacher);

            // Act
            var result = await _controller.CreateTeacher(teacherRequest);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(_controller.GetTeacherById), createdResult.ActionName);
            Assert.Equal(teacher, createdResult.Value);
        }

        [Fact]
        public async Task GetAllTeachers_ReturnsOkWithTeachers()
        {
            // Arrange
            var teachers = new List<Teacher>
            {
                new Teacher { Id = Guid.NewGuid().ToString(), Name = "Teacher1" },
                new Teacher { Id = Guid.NewGuid().ToString(), Name = "Teacher2" }
            };

            _teacherServiceMock.Setup(s => s.GetAllTeachersAsync())
                .ReturnsAsync(teachers);

            // Act
            var result = await _controller.GetAllTeachers();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(teachers, okResult.Value);
        }

        [Fact]
        public async Task GetTeacherById_ReturnsOk_WhenFound()
        {
            // Arrange
            var id = Guid.NewGuid().ToString();
            var teacher = new Teacher { Id = id, Name = "Teacher1" };

            _teacherServiceMock.Setup(s => s.GetTeacherByIdAsync(id))
                .ReturnsAsync(teacher);

            // Act
            var result = await _controller.GetTeacherById(id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(teacher, okResult.Value);
        }

        [Fact]
        public async Task GetTeacherById_ReturnsNotFound_WhenNotFound()
        {
            // Arrange
            var id = Guid.NewGuid().ToString();

            _teacherServiceMock.Setup(s => s.GetTeacherByIdAsync(id))
                .ReturnsAsync((Teacher?)null);

            // Act
            var result = await _controller.GetTeacherById(id);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.NotNull(notFoundResult.Value);
            Assert.Contains(id, notFoundResult.Value.ToString());
        }

        [Fact]
        public async Task GetTeacherByEmail_ReturnsOk_WhenFound()
        {
            // Arrange
            var email = "teacher@example.com";
            var teacher = new Teacher { Id = Guid.NewGuid().ToString(), Name = "Teacher1", Email = email };

            _teacherServiceMock.Setup(s => s.GetByEmailAsync(email))
                .ReturnsAsync(teacher);

            // Act
            var result = await _controller.GetTeacherByEmail(email);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(teacher, okResult.Value);
        }

        [Fact]
        public async Task UpdateTeacher_ReturnsOk_WithUpdatedTeacher()
        {
            // Arrange
            var id = Guid.NewGuid().ToString();
            var updateRequest = new TeacherUpdateRequestDTO { Name = "Updated Name" };
            var updatedTeacher = new Teacher { Id = id, Name = "Updated Name" };

            _teacherServiceMock.Setup(s => s.UpdateTeacherAsync(id, updateRequest))
                .ReturnsAsync(updatedTeacher);

            // Act
            var result = await _controller.UpdateTeacher(id, updateRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(updatedTeacher, okResult.Value);
        }

        [Fact]
        public async Task DeleteTeacherAsync_ReturnsUpdatedTeacher_WhenFound()
        {
            // Arrange
            var id = Guid.NewGuid().ToString();
            var existingTeacher = new Teacher { Id = id, Name = "Teacher1", Status = "Active" };
            var updatedTeacher = new Teacher { Id = id, Name = "Teacher1", Status = "Inactive" };

            _teacherServiceMock.Setup(s => s.GetTeacherByIdAsync(id))
                .ReturnsAsync(existingTeacher);
            _teacherServiceMock.Setup(s => s.UpdateTeacherAsync(id, It.Is<TeacherUpdateRequestDTO>(t => t.Status == "Inactive")))
                .ReturnsAsync(updatedTeacher);

            // Act
            var result = await _controller.DeleteTeacherAsync(id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Inactive", result.Status);
        }

        [Fact]
        public async Task DeleteTeacherAsync_ThrowsKeyNotFoundException_WhenNotFound()
        {
            // Arrange
            var id = Guid.NewGuid().ToString();

            _teacherServiceMock.Setup(s => s.GetTeacherByIdAsync(id))
                .ReturnsAsync((Teacher?)null);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _controller.DeleteTeacherAsync(id));
        }
    }
}




