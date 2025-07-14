using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using QuizApp.DTOs;
using QuizApp.Interfaces;
using QuizApp.Models;
using QuizApp.Services;
using Xunit;

namespace QuizApp.Tests.Services
{
    public class AttemptQuizServiceTests
    {
        private readonly Mock<IRepository<string, Quiz>> _mockQuizRepo;
        private readonly Mock<IRepository<string, CompletedQuiz>> _mockCompletedQuizRepo;
        private readonly AttemptQuizService _service;

        public AttemptQuizServiceTests()
        {
            _mockQuizRepo = new Mock<IRepository<string, Quiz>>();
            _mockCompletedQuizRepo = new Mock<IRepository<string, CompletedQuiz>>();
            _service = new AttemptQuizService(_mockQuizRepo.Object, _mockCompletedQuizRepo.Object);
        }

        [Fact]
        public async Task AttemptQuizAsync_ShouldReturnAttemptQuizResponse_WhenQuizExists()
        {
            // Arrange
            var quizId = "quiz-1";
            var quiz = new Quiz
            {
                Id = quizId,
                Title = "Test Quiz",
                Questions = new List<Question>
                {
                    new Question
                    {
                        Id = "q1",
                        QuestionText = "Sample Question?",
                        Options = new List<Option>
                        {
                            new Option { Id = "opt1", OptionText = "Option 1" }
                        }
                    }
                }
            };
            _mockQuizRepo.Setup(r => r.GetById(quizId)).ReturnsAsync(quiz);

            // Act
            var result = await _service.AttemptQuizAsync(quizId);

            // Assert
            Assert.Equal(quizId, result.QuizId);
            Assert.Single(result.Questions);
        }

        [Fact]
        public async Task AttemptQuizAsync_ShouldThrowException_WhenQuizNotFound()
        {
            // Arrange
            _mockQuizRepo.Setup(r => r.GetById("invalid-id")).ReturnsAsync((Quiz)null!);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.AttemptQuizAsync("invalid-id"));
        }

        [Fact]
        public async Task SubmitQuizAsync_ShouldReturnCompletedQuiz_WhenQuizExists()
        {
            // Arrange
            var quizId = "quiz-1";
            var quiz = new Quiz
            {
                Id = quizId,
                Title = "Test Quiz",
                TotalMarks = 10,
                Questions = new List<Question>()
            };

            var submitRequest = new SubmitQuizRequestDTO
            {
                QuizId = quizId,
                StudentEmail = "student@test.com",
                StartedAt = DateTime.UtcNow.AddMinutes(-5),
                EndedAt = DateTime.UtcNow
            };

            _mockQuizRepo.Setup(r => r.GetById(quizId)).ReturnsAsync(quiz);
            _mockCompletedQuizRepo.Setup(r => r.Add(It.IsAny<CompletedQuiz>())).ReturnsAsync((CompletedQuiz completedQuiz) => completedQuiz);

            // Act
            var result = await _service.SubmitQuizAsync(submitRequest);

            // Assert
            Assert.Equal(submitRequest.StudentEmail, result.StudentEmail);
            Assert.Equal(quizId, result.QuizId);
        }

        [Fact]
        public async Task SubmitQuizAsync_ShouldThrowException_WhenQuizNotFound()
        {
            // Arrange
            var request = new SubmitQuizRequestDTO { QuizId = "invalid" };
            _mockQuizRepo.Setup(r => r.GetById(request.QuizId)).ReturnsAsync((Quiz)null!);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.SubmitQuizAsync(request));
        }

        [Fact]
        public async Task SubmitQuizAsync_ShouldCalculateMarksCorrectly()
        {
            // Arrange
            var quizId = "quiz-1";
            var quiz = new Quiz
            {
                Id = quizId,
                Title = "Test Quiz",
                TotalMarks = 10,
                Questions = new List<Question>
                {
                    new Question
                    {
                        Id = "q1",
                        Mark = 5,
                        Options = new List<Option>
                        {
                            new Option { Id = "opt1", IsCorrect = true },
                            new Option { Id = "opt2", IsCorrect = false }
                        }
                    }
                }
            };

            var submitRequest = new SubmitQuizRequestDTO
            {
                QuizId = quizId,
                StudentEmail = "student@test.com",
                Questions = new List<SubmitQuestionDTO>
                {
                    new SubmitQuestionDTO
                    {
                        QuestionId = "q1",
                        SelectedOptionIds = new List<string> { "opt1" }  // correct option selected
                    }
                },
                StartedAt = DateTime.UtcNow.AddMinutes(-5),
                EndedAt = DateTime.UtcNow
            };

            _mockQuizRepo.Setup(r => r.GetById(quizId)).ReturnsAsync(quiz);
            _mockCompletedQuizRepo.Setup(r => r.Add(It.IsAny<CompletedQuiz>())).ReturnsAsync((CompletedQuiz completedQuiz) => completedQuiz);

            // Act
            var result = await _service.SubmitQuizAsync(submitRequest);

            // Assert
            Assert.Equal(quiz.TotalMarks, result.TotalScore);
            Assert.True(result.TotalScore > 0);
        }

        [Fact]
        public async Task SubmitQuizAsync_ShouldPersistCompletedQuiz()
        {
            // Arrange
            var quizId = "quiz-1";
            var quiz = new Quiz { Id = quizId, Title = "Test Quiz", Questions = new List<Question>() };
            var request = new SubmitQuizRequestDTO
            {
                QuizId = quizId,
                StudentEmail = "student@test.com",
                StartedAt = DateTime.UtcNow,
                EndedAt = DateTime.UtcNow
            };

            _mockQuizRepo.Setup(r => r.GetById(quizId)).ReturnsAsync(quiz);
            _mockCompletedQuizRepo.Setup(r => r.Add(It.IsAny<CompletedQuiz>())).ReturnsAsync((CompletedQuiz completedQuiz) => completedQuiz);

            // Act
            var result = await _service.SubmitQuizAsync(request);

            // Assert
            _mockCompletedQuizRepo.Verify(r => r.Add(It.IsAny<CompletedQuiz>()), Times.Once);
        }
    }
}
