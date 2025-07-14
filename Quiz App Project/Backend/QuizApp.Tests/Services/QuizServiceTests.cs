using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using QuizApp.DTOs;
using QuizApp.Interfaces;
using QuizApp.Models;
using QuizApp.Services;
using Xunit;

namespace QuizApp.Tests.Services
{
    public class QuizServiceTests
    {
        private readonly Mock<IRepository<string, Quiz>> _quizRepositoryMock;
        private readonly Mock<ITeacherService> _teacherServiceMock;
        private readonly QuizService _quizService;

        public QuizServiceTests()
        {
            _quizRepositoryMock = new Mock<IRepository<string, Quiz>>();
            _teacherServiceMock = new Mock<ITeacherService>();

            _quizService = new QuizService(
                _quizRepositoryMock.Object,
                _teacherServiceMock.Object
            );
        }

        [Fact]
        public async Task CreateQuizAsync_WithValidData_ReturnsCreatedQuiz()
        {
            // Arrange
            var teacherEmail = "teacher@example.com";
            var createQuizDto = new CreateQuizRequestDTO
            {
                Title = "Sample Quiz",
                Category = "General",
                UploadedBy = teacherEmail,
                TotalMarks = 10,
                Questions = new List<CreateQuestionDTO>
                {
                    new CreateQuestionDTO
                    {
                        QuestionText = "What is 2 + 2?",
                        Mark = 2,
                        Options = new List<CreateOptionDTO>
                        {
                            new CreateOptionDTO { OptionText = "3", IsCorrect = false },
                            new CreateOptionDTO { OptionText = "4", IsCorrect = true }
                        }
                    }
                }
            };

            var mockTeacher = new Teacher { Id = "T001", Email = teacherEmail };

            _teacherServiceMock
                .Setup(t => t.GetByEmailAsync(teacherEmail))
                .ReturnsAsync(mockTeacher);

            _quizRepositoryMock
                .Setup(q => q.Add(It.IsAny<Quiz>()))
                .ReturnsAsync((Quiz quiz) => quiz);

            // Act
            var createdQuiz = await _quizService.CreateQuizAsync(createQuizDto);

            // Assert
            Assert.NotNull(createdQuiz);
            Assert.Equal(createQuizDto.Title, createdQuiz.Title);
            Assert.Single(createdQuiz.Questions);
        }

        [Fact]
        public async Task CreateQuizAsync_WithInvalidTeacher_ThrowsException()
        {
            // Arrange
            var createQuizDto = new CreateQuizRequestDTO
            {
                Title = "Invalid Teacher Quiz",
                Category = "General",
                UploadedBy = "invalid@example.com",
                TotalMarks = 10,
                Questions = new List<CreateQuestionDTO>()
            };

            _teacherServiceMock
                .Setup(t => t.GetByEmailAsync(createQuizDto.UploadedBy))
                .ReturnsAsync((Teacher)null!);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() => _quizService.CreateQuizAsync(createQuizDto));
            Assert.Equal("Teacher not found", ex.Message);
        }

        [Fact]
        public async Task GetQuizByIdAsync_WithExistingQuiz_ReturnsQuiz()
        {
            // Arrange
            var quizId = "QI123";
            var quiz = new Quiz { Id = quizId, Title = "Test Quiz" };

            _quizRepositoryMock
                .Setup(q => q.GetById(quizId))
                .ReturnsAsync(quiz);

            // Act
            var result = await _quizService.GetQuizByIdAsync(quizId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(quizId, result?.Id);
        }

        [Fact]
        public async Task GetQuizByIdAsync_WithNonExistingQuiz_ReturnsNull()
        {
            // Arrange
            var quizId = "NON_EXISTING";

            _quizRepositoryMock
                .Setup(q => q.GetById(quizId))
                .ReturnsAsync((Quiz)null!);

            // Act
            var result = await _quizService.GetQuizByIdAsync(quizId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetAllQuizzesAsync_ReturnsListOfQuizzes()
        {
            // Arrange
            var quizzes = new List<Quiz>
            {
                new Quiz { Id = "Q1", Title = "Quiz 1" },
                new Quiz { Id = "Q2", Title = "Quiz 2" }
            };

            _quizRepositoryMock
                .Setup(q => q.GetAll())
                .ReturnsAsync(quizzes);

            // Act
            var result = await _quizService.GetAllQuizzesAsync();

            // Assert
            Assert.NotEmpty(result);
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task DeleteQuizAsync_WithExistingQuiz_ReturnsDeletedQuiz()
        {
            // Arrange
            var quizId = "QI123";
            var quiz = new Quiz { Id = quizId, Title = "To be deleted" };

            _quizRepositoryMock
                .Setup(q => q.GetById(quizId))
                .ReturnsAsync(quiz);

            _quizRepositoryMock
                .Setup(q => q.Delete(quiz))
                .ReturnsAsync(quiz);

            // Act
            var result = await _quizService.DeleteQuizAsync(quizId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(quizId, result.Id);
        }

        [Fact]
        public async Task DeleteQuizAsync_WithNonExistingQuiz_ThrowsException()
        {
            // Arrange
            var quizId = "NON_EXISTING";

            _quizRepositoryMock
                .Setup(q => q.GetById(quizId))
                .ReturnsAsync((Quiz)null!);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() => _quizService.DeleteQuizAsync(quizId));
            Assert.Equal("Quiz not found", ex.Message);
        }
    }
}
