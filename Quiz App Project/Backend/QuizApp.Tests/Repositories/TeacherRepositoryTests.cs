using Microsoft.EntityFrameworkCore;
using QuizApp.Contexts;
using QuizApp.Models;
using QuizApp.Repositories;
using QuizApp.Tests.DbContexts;
using Xunit;

namespace QuizApp.Tests.Repositories
{
    public class TeacherRepositoryTests
    {
        private readonly QuizAppContext _context;
        private readonly TeacherRepository _teacherRepository;

        public TeacherRepositoryTests()
        {
            _context = TestDbContextFactory.CreateInMemoryContext();
            _teacherRepository = new TeacherRepository(_context);
        }

        [Fact]
        public async Task Add_ShouldAddTeacher()
        {
            // Arrange
            var teacher = new Teacher
            {
                Id = Guid.NewGuid().ToString(),
                Name = "John Doe",
                Email = "john@example.com",
                PhoneNumber = "1234567890",
                Status = "Active"
            };

            // Act
            var result = await _teacherRepository.Add(teacher);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(teacher.Id, result.Id);
            Assert.Single(_context.Teachers);
        }

        [Fact]
        public async Task GetById_ShouldReturnTeacher_WhenExists()
        {
            // Arrange
            var teacher = new Teacher
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Jane Doe",
                Email = "jane@example.com",
                PhoneNumber = "9876543210",
                Status = "Active"
            };
            await _context.Teachers.AddAsync(teacher);
            await _context.SaveChangesAsync();

            // Act
            var result = await _teacherRepository.GetById(teacher.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(teacher.Name, result.Name);
        }

        [Fact]
        public async Task GetAll_ShouldReturnAllTeachers()
        {
            // Arrange
            _context.Teachers.AddRange(
                new Teacher { Id = Guid.NewGuid().ToString(), Name = "Teacher1", Email = "t1@example.com", PhoneNumber = "1111111111", Status = "Active" },
                new Teacher { Id = Guid.NewGuid().ToString(), Name = "Teacher2", Email = "t2@example.com", PhoneNumber = "2222222222", Status = "Inactive" }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = await _teacherRepository.GetAll();

            // Assert
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task Update_ShouldModifyTeacher()
        {
            // Arrange
            var teacher = new Teacher
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Old Name",
                Email = "old@example.com",
                PhoneNumber = "0000000000",
                Status = "Active"
            };
            await _context.Teachers.AddAsync(teacher);
            await _context.SaveChangesAsync();

            var updatedTeacher = new Teacher
            {
                Id = teacher.Id,
                Name = "New Name",
                Email = "new@example.com",
                PhoneNumber = "9999999999",
                Status = "Inactive"
            };

            // Act
            var result = await _teacherRepository.Update(teacher.Id, updatedTeacher);

            // Assert
            Assert.Equal("New Name", result.Name);
            Assert.Equal("new@example.com", result.Email);
            Assert.Equal("9999999999", result.PhoneNumber);
            Assert.Equal("Inactive", result.Status);
        }

        [Fact]
        public async Task Delete_ShouldRemoveTeacher()
        {
            // Arrange
            var teacher = new Teacher
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Delete Me",
                Email = "deleteme@example.com",
                PhoneNumber = "5555555555",
                Status = "Active"
            };
            await _context.Teachers.AddAsync(teacher);
            await _context.SaveChangesAsync();

            // Act
            var result = await _teacherRepository.Delete(teacher);

            // Assert
            Assert.Equal(0, _context.Teachers.Count());
        }

        [Fact]
        public async Task GetById_ShouldThrowException_WhenNotFound()
        {
            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _teacherRepository.GetById("non-existent-id"));
            Assert.Equal("Teacher not found with the key", ex.Message);
        }
    }
}
