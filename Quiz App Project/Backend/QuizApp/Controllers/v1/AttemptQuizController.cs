using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using QuizApp.DTOs;
using QuizApp.Interfaces;

namespace QuizApp.Controllers.v1
{
    [ApiController]
    [EnableRateLimiting("FixedPolicy")]
    [Route("api/v{version:apiVersion}/attempt-quiz")]
    [ApiVersion("1.0")]
    public class AttemptQuizController : ControllerBase
    {
        private readonly IAttemptQuizService _attemptQuizService;

        public AttemptQuizController(IAttemptQuizService attemptQuizService)
        {
            _attemptQuizService = attemptQuizService;
        }

        [HttpGet("{quizId}")]
        [MapToApiVersion("1.0")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> AttemptQuiz(string quizId)
        {
            var response = await _attemptQuizService.AttemptQuizAsync(quizId);
            return Ok(response);
        }

        [HttpPost("submit")]
        [MapToApiVersion("1.0")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> SubmitQuiz([FromBody] SubmitQuizRequestDTO request)
        {
            if (request == null)
                return BadRequest("Request cannot be null");

            var completedQuiz = await _attemptQuizService.SubmitQuizAsync(request);
            return Ok(completedQuiz);
        }
    }
}