using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using QuizApp.Controllers.v1;
using QuizApp.DTOs;
using QuizApp.Interfaces;
using Xunit;

namespace QuizApp.Tests.Controllers
{
    public class QuizControllerTests
    {
        private readonly Mock<IQuizService> _mockQuizService;
        private readonly Mock<ITeacherService> _mockTeacherService;
        private readonly Mock<IQuizTemplateService> _mockTemplateService;
        private readonly QuizController _controller;

        public QuizControllerTests()
        {
            _mockQuizService = new Mock<IQuizService>();
            _mockTeacherService = new Mock<ITeacherService>();
            _mockTemplateService = new Mock<IQuizTemplateService>();
            _controller = new QuizController(_mockQuizService.Object, _mockTeacherService.Object, _mockTemplateService.Object);
        }

        private void AddTeacherIdentity(string email = "teacher@example.com")
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, email),
                new Claim(ClaimTypes.Role, "Teacher")
            }, "mock"));
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }


        [Fact]
        public async Task CreateQuiz_ShouldReturnUnauthorized_WhenEmailClaimMissing()
        {
            // Arrange
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext() // no claims
            };

            // Act
            var result = await _controller.CreateQuiz(new CreateQuizRequestDTO());

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, unauthorizedResult.StatusCode);
        }

        [Fact]
        public void DownloadQuizTemplate_ShouldReturnFile()
        {
            // Arrange
            var fileBytes = new byte[] { 0x01, 0x02 };
            _mockTemplateService.Setup(s => s.GenerateQuizTemplate(It.IsAny<int>(), It.IsAny<int>())).Returns(fileBytes);

            // Act
            var result = _controller.DownloadQuizTemplate(3, 2) as FileContentResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", result.ContentType);
            Assert.Equal(fileBytes, result.FileContents);
        }

      
        [Fact]
        public async Task BulkUploadQuiz_ShouldReturnBadRequest_WhenFileMissing()
        {
            // Arrange
            var fileUploadDto = new FileUploadDTO { File = null! };

            // Act
            var result = await _controller.BulkUploadQuiz(fileUploadDto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequest.StatusCode);
        }

        

        [Fact]
        public async Task GetQuizById_ShouldReturnNotFound_WhenQuizDoesNotExist()
        {
            // Arrange
            var quizId = "non-existent";
            _mockQuizService.Setup(s => s.GetQuizByIdAsync(quizId)).ThrowsAsync(new Exception("Quiz not found"));

            // Act
            var result = await _controller.GetQuizById(quizId);

            // Assert
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal(404, notFound.StatusCode);
            Assert.Equal("Quiz not found", notFound.Value);
        }
    }
}
