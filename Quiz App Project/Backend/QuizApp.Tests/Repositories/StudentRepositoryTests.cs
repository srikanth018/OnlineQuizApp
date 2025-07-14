using Microsoft.EntityFrameworkCore;
using QuizApp.Contexts;
using QuizApp.Models;
using QuizApp.Repositories;
using QuizApp.Tests.DbContexts;
using Xunit;

namespace QuizApp.Tests.Repositories
{
    public class StudentRepositoryTests
    {
        private readonly QuizAppContext _context;
        private readonly StudentRepository _repository;

        public StudentRepositoryTests()
        {
            _context = TestDbContextFactory.CreateInMemoryContext();
            _repository = new StudentRepository(_context);
        }

        [Fact]
        public async Task Add_ShouldAddStudentToDatabase()
        {
            // Arrange
            var student = new Student
            {
                Id = Guid.NewGuid().ToString(),
                Name = "student1",
                Email = "student1@example.com",
                PhoneNumber = "1234567890",
                DateOfBirth = new DateTime(2000, 1, 1),
                HighestQualification = "B.Tech",
                Status = "Active"
            };

            // Act
            await _repository.Add(student);
            var savedStudent = await _context.Students.FirstOrDefaultAsync(s => s.Email == student.Email);

            // Assert
            Assert.NotNull(savedStudent);
            Assert.Equal(student.Email, savedStudent!.Email);
        }

        [Fact]
        public async Task GetAll_ShouldReturnAllStudents()
        {
            // Arrange
            _context.Students.Add(new Student { Id = Guid.NewGuid().ToString(), Name = "Student1", Email = "s1@example.com" });
            _context.Students.Add(new Student { Id = Guid.NewGuid().ToString(), Name = "Student2", Email = "s2@example.com" });
            await _context.SaveChangesAsync();

            // Act
            var students = await _repository.GetAll();

            // Assert
            Assert.NotNull(students);
            Assert.Equal(2, students.Count);
        }

        [Fact]
        public async Task GetById_ShouldReturnStudent_WhenExists()
        {
            // Arrange
            var email = "unique@example.com";
            var student = new Student { Id = Guid.NewGuid().ToString(), Name = "Unique Student", Email = email };
            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetById(email);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(email, result.Email);
        }

        [Fact]
        public async Task GetById_ShouldThrowException_WhenNotFound()
        {
            // Arrange
            var email = "notfound@example.com";

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _repository.GetById(email));
        }

        [Fact]
        public async Task Update_ShouldUpdateExistingStudent()
        {
            // Arrange
            var email = "update@example.com";
            var student = new Student { Id = Guid.NewGuid().ToString(), Name = "Old Name", Email = email };
            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            var updatedStudent = new Student
            {
                Id = student.Id, // Keep the same ID
                Name = "Updated Name",
                Email = email,
                PhoneNumber = "9876543210",
                HighestQualification = "MCA",
                Status = "Active"
            };

            // Act
            var result = await _repository.Update(email, updatedStudent);

            // Assert
            Assert.Equal("Updated Name", result.Name);
            Assert.Equal("9876543210", result.PhoneNumber);
            Assert.Equal("MCA", result.HighestQualification);
        }

        [Fact]
        public async Task Delete_ShouldRemoveStudentFromDatabase()
        {
            // Arrange
            var student = new Student { Id = Guid.NewGuid().ToString(), Name = "To Delete", Email = "delete@example.com" };
            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.Delete(student);

            // Assert
            var deletedStudent = await _context.Students.FirstOrDefaultAsync(s => s.Email == student.Email);
            Assert.Null(deletedStudent);
            Assert.Equal(student.Email, result.Email);
        }

        [Fact]
        public async Task Delete_ShouldThrowException_WhenItemIsNull()
        {
            // Arrange
            Student? student = null;

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _repository.Delete(student!));
        }
    }
}
