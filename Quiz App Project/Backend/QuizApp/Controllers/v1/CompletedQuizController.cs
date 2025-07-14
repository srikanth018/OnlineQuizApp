using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizApp.Interfaces;
using QuizApp.Models;

namespace QuizApp.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/completed-quizzes")]
    [ApiVersion("1.0")]
    public class CompletedQuizController : ControllerBase
    {
        private readonly ICompletedQuizService _completedQuizService;

        public CompletedQuizController(ICompletedQuizService completedQuizService)
        {
            _completedQuizService = completedQuizService;
        }

        [HttpGet]
        [MapToApiVersion("1.0")]
        [Authorize]
        public async Task<ActionResult<ICollection<CompletedQuiz>>> GetAllCompletedQuizzes()
        {
            var quizzes = await _completedQuizService.GetAllCompletedQuizzesAsync();
            if (quizzes == null || !quizzes.Any())
                return NotFound("No completed quizzes found.");
            return Ok(quizzes);
        }

        [HttpGet("{id}")]
        [MapToApiVersion("1.0")]
        [Authorize]
        public async Task<ActionResult<CompletedQuiz>> GetCompletedQuizById(string id)
        {
            var quiz = await _completedQuizService.GetCompletedQuizByIdAsync(id);
            if (quiz == null)
                return NotFound($"Completed quiz with id {id} not found.");
            return Ok(quiz);
        }

        [HttpGet("student")]
        [MapToApiVersion("1.0")]
        [Authorize]
        public async Task<ActionResult<ICollection<CompletedQuiz>>> GetCompletedQuizzesByStudentEmail([FromQuery] string studentEmail)
        {
            var quizzes = await _completedQuizService.GetCompletedQuizzesByStudentEmailAsync(studentEmail);
            return Ok(quizzes);
        }

        [HttpGet("quizId/{quizId}")]
        [MapToApiVersion("1.0")]
        [Authorize]
        public async Task<ActionResult<ICollection<CompletedQuiz>>> GetCompletedQuizByQuizId(string quizId)
        {
            var quizzes = await _completedQuizService.GetCompletedQuizByQuizIdAsync(quizId);
            if (quizzes == null || !quizzes.Any())
                return NotFound($"No completed quizzes found for quiz id {quizId}.");
            return Ok(quizzes);
        }
    }
}
