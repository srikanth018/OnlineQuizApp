using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using QuizApp.Models;
using QuizApp.Repositories; // Assuming your concrete repository is here
using QuizApp.Tests.DbContexts;
using Xunit;

namespace QuizApp.Tests.Repositories
{
    public class UserRepositoryTests
    {

        [Fact]
        public async Task Add_AddsUserToDatabase()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var repository = new UserRepository(context);

            var user = new User
            {
                Email = "test@example.com",
                Role = "Student",
                Password = "hashedPassword"
            };

            // Act
            await repository.Add(user);
            await context.SaveChangesAsync();

            // Assert
            var savedUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
            Assert.NotNull(savedUser);
            Assert.Equal("test@example.com", savedUser.Email);
        }

        [Fact]
        public async Task GetById_ReturnsUser_WhenUserExists()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var repository = new UserRepository(context);

            var user = new User { Email = "findme@example.com", Role = "Teacher", Password = "pass" };
            await context.Users.AddAsync(user);
            await context.SaveChangesAsync();

            // Act
            var retrievedUser = await repository.GetById(user.Email);

            // Assert
            Assert.NotNull(retrievedUser);
            Assert.Equal(user.Email, retrievedUser.Email);
        }

        [Fact]
        public async Task GetAll_ReturnsAllUsers()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var repository = new UserRepository(context);

            await context.Users.AddRangeAsync(
                new User { Email = "u1@example.com", Role = "Student", Password = "123" },
                new User { Email = "u2@example.com", Role = "Teacher", Password = "456" }
            );
            await context.SaveChangesAsync();

            // Act
            var users = await repository.GetAll();

            // Assert
            Assert.NotEmpty(users);
            Assert.Equal(2, users.Count());
        }
    }
}
