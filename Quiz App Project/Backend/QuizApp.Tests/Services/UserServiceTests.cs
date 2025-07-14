using Microsoft.EntityFrameworkCore;
using QuizApp.Contexts;
using QuizApp.Models;
using QuizApp.Repositories;
using QuizApp.Services;
using QuizApp.Tests.DbContexts;
using Xunit;

namespace QuizApp.Tests.Services
{
    public class UserServiceTests
    {
        private readonly QuizAppContext _context;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _context = TestDbContextFactory.CreateInMemoryContext();

            var repository = new UserRepository(_context);
            _userService = new UserService(repository);
        }

        [Fact]
        public async Task GetUserByIdAsync_ShouldReturnUser_WhenUserExists()
        {
            // Arrange
            var user = new User
            {
                Email = "testuser@example.com",
                Role = "Admin",
                Password = "password"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userService.GetUserByIdAsync(user.Email);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user.Email, result?.Email);
        }

        [Fact]
        public async Task GetUserByIdAsync_ShouldReturnNull_WhenUserDoesNotExist()
        {
            // Act
            var result = await _userService.GetUserByIdAsync("nonexistent@example.com");

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetAllUsersAsync_ShouldReturnAllUsers()
        {
            // Arrange
            var user1 = new User { Email = "user1@example.com", Role = "Student", Password = "pass1" };
            var user2 = new User { Email = "user2@example.com", Role = "Teacher", Password = "pass2" };

            _context.Users.AddRange(user1, user2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userService.GetAllUsersAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
        }
    }
}
