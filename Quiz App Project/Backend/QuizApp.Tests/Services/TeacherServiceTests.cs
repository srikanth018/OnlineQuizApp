using Moq;
using QuizApp.DTOs;
using QuizApp.Interfaces;
using QuizApp.Models;
using QuizApp.Services;
using Xunit;

namespace QuizApp.Tests.Services
{
    public class TeacherServiceTests
    {
        private readonly Mock<IRepository<string, Teacher>> _teacherRepositoryMock;
        private readonly Mock<IRepository<string, User>> _userRepositoryMock;
        private readonly TeacherService _teacherService;

        public TeacherServiceTests()
        {
            _teacherRepositoryMock = new Mock<IRepository<string, Teacher>>();
            _userRepositoryMock = new Mock<IRepository<string, User>>();
            _teacherService = new TeacherService(_teacherRepositoryMock.Object, _userRepositoryMock.Object);
        }

        [Fact]
        public async Task CreateTeacherAsync_ShouldCreateTeacherAndUser()
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
                PhoneNumber = teacherRequest.PhoneNumber,
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                User = new User
                {
                    Email = teacherRequest.Email,
                    Password = teacherRequest.Password,
                    Role = "Teacher",
                    CreatedAt = DateTime.UtcNow
                }
            };

            _userRepositoryMock.Setup(r => r.Add(It.IsAny<User>())).ReturnsAsync(teacher.User);
            _teacherRepositoryMock.Setup(r => r.Add(It.IsAny<Teacher>())).ReturnsAsync(teacher);

            // Act
            var result = await _teacherService.CreateTeacherAsync(teacherRequest);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(teacher.Email, result.Email);
            _userRepositoryMock.Verify(r => r.Add(It.IsAny<User>()), Times.Once);
            _teacherRepositoryMock.Verify(r => r.Add(It.IsAny<Teacher>()), Times.Once);
        }

        [Fact]
        public async Task DeleteTeacherAsync_ShouldDeleteTeacher_WhenTeacherExists()
        {
            // Arrange
            var teacherId = Guid.NewGuid().ToString();
            var teacher = new Teacher { Id = teacherId, Name = "Jane Doe" };

            _teacherRepositoryMock.Setup(r => r.GetById(teacherId)).ReturnsAsync(teacher);
            _teacherRepositoryMock.Setup(r => r.Delete(teacher)).ReturnsAsync(teacher);

            // Act
            var result = await _teacherService.DeleteTeacherAsync(teacherId);

            // Assert
            Assert.Equal(teacherId, result.Id);
            _teacherRepositoryMock.Verify(r => r.GetById(teacherId), Times.Once);
            _teacherRepositoryMock.Verify(r => r.Delete(teacher), Times.Once);
        }

        [Fact]
        public async Task DeleteTeacherAsync_ShouldThrowException_WhenTeacherNotFound()
        {
            // Arrange
            var teacherId = "nonexistent";
            _teacherRepositoryMock.Setup(r => r.GetById(teacherId)).ThrowsAsync(new Exception("Teacher not found with the key"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _teacherService.DeleteTeacherAsync(teacherId));
        }

        [Fact]
        public async Task GetAllTeachersAsync_ShouldReturnAllTeachers()
        {
            // Arrange
            var teachers = new List<Teacher>
            {
                new Teacher { Id = Guid.NewGuid().ToString(), Name = "Teacher1" },
                new Teacher { Id = Guid.NewGuid().ToString(), Name = "Teacher2" }
            };

            _teacherRepositoryMock.Setup(r => r.GetAll()).ReturnsAsync(teachers);

            // Act
            var result = await _teacherService.GetAllTeachersAsync();

            // Assert
            Assert.Equal(2, result.Count());
            _teacherRepositoryMock.Verify(r => r.GetAll(), Times.Once);
        }

        [Fact]
        public async Task GetByEmailAsync_ShouldReturnTeacher_WhenFound()
        {
            // Arrange
            var email = "teacher@example.com";
            var teachers = new List<Teacher>
            {
                new Teacher { Id = Guid.NewGuid().ToString(), Name = "Teacher1", Email = email }
            };

            _teacherRepositoryMock.Setup(r => r.GetAll()).ReturnsAsync(teachers);

            // Act
            var result = await _teacherService.GetByEmailAsync(email);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(email, result.Email);
        }

        [Fact]
        public async Task GetByEmailAsync_ShouldThrowException_WhenNotFound()
        {
            // Arrange
            var email = "notfound@example.com";
            _teacherRepositoryMock.Setup(r => r.GetAll()).ReturnsAsync(new List<Teacher>());

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _teacherService.GetByEmailAsync(email));
        }

        [Fact]
        public async Task GetTeacherByIdAsync_ShouldReturnTeacher_WhenFound()
        {
            // Arrange
            var id = Guid.NewGuid().ToString();
            var teacher = new Teacher { Id = id, Name = "Teacher1" };
            _teacherRepositoryMock.Setup(r => r.GetById(id)).ReturnsAsync(teacher);

            // Act
            var result = await _teacherService.GetTeacherByIdAsync(id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(id, result?.Id);
        }

        [Fact]
        public async Task UpdateTeacherAsync_ShouldUpdateTeacher_WhenTeacherExists()
        {
            // Arrange
            var id = Guid.NewGuid().ToString();
            var existingTeacher = new Teacher { Id = id, Name = "Old Name" };
            var updatedTeacher = new TeacherUpdateRequestDTO { Name = "New Name" };
            var newTeacher = new Teacher
            {
                Id = id,
                Name = updatedTeacher.Name,
                Email = existingTeacher.Email,
                PhoneNumber = existingTeacher.PhoneNumber,
                Status = existingTeacher.Status
            };

            _teacherRepositoryMock.Setup(r => r.GetById(id)).ReturnsAsync(existingTeacher);
            _teacherRepositoryMock.Setup(r => r.Update(id, newTeacher)).ReturnsAsync(newTeacher);


            var result = await _teacherService.UpdateTeacherAsync(id, updatedTeacher);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Name", result.Name);
            _teacherRepositoryMock.Verify(r => r.GetById(id), Times.Once);
            _teacherRepositoryMock.Verify(r => r.Update(id, newTeacher), Times.Once);
        }

        [Fact]
        public async Task UpdateTeacherAsync_ShouldThrowException_WhenTeacherNotFound()
        {
            // Arrange
            var id = "nonexistent";
            var updatedTeacher = new TeacherUpdateRequestDTO { Name = "Name" };
            _teacherRepositoryMock.Setup(r => r.GetById(id)).ReturnsAsync((Teacher?)null!);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _teacherService.UpdateTeacherAsync(id, updatedTeacher));
        }
    }
}
