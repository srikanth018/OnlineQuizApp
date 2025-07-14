using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using QuizApp.Contexts;
using QuizApp.Interfaces;
using QuizApp.Models;
using QuizApp.Repositories;
using QuizApp.Services;
using QuizApp.Tests.DbContexts;
using Xunit;

namespace QuizApp.Tests.Services
{
    public class CompletedQuizServiceTests
    {
        [Fact]
        public async Task GetAllCompletedQuizzesAsync_ReturnsAllQuizzes()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var repo = new CompletedQuizRepository(context);
            context.CompletedQuizzes.AddRange(
                new CompletedQuiz { Id = "1", StudentEmail = "test1@example.com", QuizId = "Quiz1" },
                new CompletedQuiz { Id = "2", StudentEmail = "test2@example.com", QuizId = "Quiz2" }
            );
            await context.SaveChangesAsync();

            var service = new CompletedQuizService(repo);

            // Act
            var result = await service.GetAllCompletedQuizzesAsync();

            // Assert
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetCompletedQuizByIdAsync_ReturnsCorrectQuiz()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var repo = new CompletedQuizRepository(context);
            var quiz = new CompletedQuiz { Id = "123", StudentEmail = "student@example.com", QuizId = "QuizX" };
            context.CompletedQuizzes.Add(quiz);
            await context.SaveChangesAsync();

            var service = new CompletedQuizService(repo);

            // Act
            var result = await service.GetCompletedQuizByIdAsync("123");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("123", result.Id);
        }

        [Fact]
        public async Task GetCompletedQuizzesByStudentEmailAsync_ReturnsMatchingQuizzes()
        {
            // Arrange
            using var context = TestDbContextFactory.CreateInMemoryContext();
            var repo = new CompletedQuizRepository(context);
            context.CompletedQuizzes.AddRange(
                new CompletedQuiz { Id = "1", StudentEmail = "test@example.com", QuizId = "Quiz1" },
                new CompletedQuiz { Id = "2", StudentEmail = "other@example.com", QuizId = "Quiz2" }
            );
            await context.SaveChangesAsync();

            var service = new CompletedQuizService(repo);

            // Act
            var result = await service.GetCompletedQuizzesByStudentEmailAsync("test@example.com");

            // Assert
            Assert.Single(result);
            Assert.Equal("test@example.com", result.First().StudentEmail);
        }
    }
}
