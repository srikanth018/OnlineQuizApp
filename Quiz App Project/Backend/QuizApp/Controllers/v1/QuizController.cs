using System.Security.Claims;
using Asp.Versioning;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using QuizApp.DTOs;
using QuizApp.Hubs;
using QuizApp.Interfaces;
using QuizApp.Misc;

namespace QuizApp.Controllers.v1
{
    [ApiController]
    [EnableRateLimiting("FixedPolicy")]
    [Route("api/v{version:apiVersion}/quizzes")]
    [ApiVersion("1.0")]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService _quizService;
        private readonly ITeacherService _teacherService;
        private readonly IQuizTemplateService _quizTemplateService;
        private readonly IHubContext<QuizHub> _hubContext;

        public QuizController(IQuizService quizService, ITeacherService teacherService,
                              IQuizTemplateService quizTemplateService, IHubContext<QuizHub> hubContext)
        {
            _quizService = quizService;
            _teacherService = teacherService;
            _quizTemplateService = quizTemplateService;
            _hubContext = hubContext;
        }

        [HttpPost("quiz")]
        [Authorize(Roles = "Teacher")]
        [MapToApiVersion("1.0")]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizRequestDTO quiz)
        {
            var emailClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (emailClaim == null)
                return Unauthorized("User email claim not found.");

            quiz.UploadedBy = emailClaim.Value;
            var createdQuiz = await _quizService.CreateQuizAsync(quiz);

            // 🧠 Notify students
            await _hubContext.Clients.All.SendAsync("ReceiveNewQuiz", quiz.Category, quiz.Title);

            return Ok(createdQuiz);
        }

        [HttpGet("template")]
        [MapToApiVersion("1.0")]
        [Authorize(Roles = "Teacher")]
        public IActionResult DownloadQuizTemplate([FromQuery] int questionCount = 5, [FromQuery] int optionCount = 4)
        {
            var file = _quizTemplateService.GenerateQuizTemplate(questionCount, optionCount);
            return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QuizTemplate.xlsx");
        }
        [HttpPost("bulk-upload")]
        [MapToApiVersion("1.0")]
        [Authorize(Roles = "Teacher")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> BulkUploadQuiz([FromForm] FileUploadDTO filedata)
        {
            System.Console.WriteLine("Bulk upload quiz called");
            if (filedata == null || filedata.File.Length == 0)
                return BadRequest("No file uploaded.");

            using var stream = filedata.File.OpenReadStream();
            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheets.First();

            var quizDto = Generators.ParseQuizFromWorksheet(filedata, worksheet);

            var createdQuiz = await _quizService.CreateQuizAsync(quizDto);

            return Ok(new { createdQuiz.Id, createdQuiz.Title });
        }
        
        [HttpGet("{id}")]
        [MapToApiVersion("1.0")]
        public async Task<IActionResult> GetQuizById(string id)
        {
            try
            {
                var quiz = await _quizService.GetQuizByIdAsync(id);
                return Ok(quiz);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("getbyteacher")]
        [MapToApiVersion("1.0")]
        public async Task<IActionResult> GetQuizzesByTeacherEmail([FromQuery] string email)
        {
            var quizzes = await _quizService.GetQuizzesByTeacherEmailAsync(email);
            return Ok(quizzes);
        }

        [HttpGet]
        [MapToApiVersion("1.0")]
        public async Task<IActionResult> GetAllQuizzes()
        {
            var quizzes = await _quizService.GetAllQuizzesAsync();
            if (quizzes == null || !quizzes.Any())
                return NotFound("No quizzes found.");
            return Ok(quizzes);
        }

        [HttpGet("search")]
        [MapToApiVersion("1.0")]
        public async Task<IActionResult> SearchQuizzes([FromQuery] string searchTerm = "",
                                                      [FromQuery] int limit = 10,
                                                      [FromQuery] int skip = 0,
                                                      [FromQuery] string category = "")
        {
            var quizzes = await _quizService.GetAndSearchWithLimit(searchTerm, limit, skip, category);
            return Ok(quizzes);
        }

        [HttpPut("question/{id}")]
        [MapToApiVersion("1.0")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateQuestion(string id, [FromBody] UpdateQuestionRequestDTO request)
        {
            if (request == null)
                return BadRequest("Request cannot be null");

            var updatedQuestion = await _quizService.UpdateQuestionAsync(id, request);
            if(updatedQuestion == null)
                return NotFound($"Question with ID {id} not found.");
            return Ok(updatedQuestion);

        }

    }
}