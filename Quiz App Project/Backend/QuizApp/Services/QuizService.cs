using Microsoft.AspNetCore.SignalR;
using QuizApp.DTOs;
using QuizApp.Hubs;
using QuizApp.Interfaces;
using QuizApp.Mappers;
using QuizApp.Models;

namespace QuizApp.Services
{
    public class QuizService : IQuizService
    {
        private readonly IRepository<string, Quiz> _quizRepository;
        private readonly ITeacherService _teacherService;
        // private readonly IHubContext<QuizHub> _hubContext;
        private readonly IRepository<string, Question> _questionRepository;
        private readonly IRepository<string, Option> _optionRepository;


        public QuizService(IRepository<string, Quiz> quizRepository,
                           ITeacherService teacherService,
                           //    IHubContext<QuizHub> hubContext
                           IRepository<string, Question> questionRepository,
                           IRepository<string, Option> optionRepository

                           )
        {
            _quizRepository = quizRepository;
            _teacherService = teacherService;
            // _hubContext = hubContext;
            _questionRepository = questionRepository;
            _optionRepository = optionRepository;
        }

        public async Task<Quiz> CreateQuizAsync(CreateQuizRequestDTO quiz)
        {
            var teacher = await _teacherService.GetByEmailAsync(quiz.UploadedBy);
            if (teacher == null)
            {
                throw new KeyNotFoundException("Teacher not found");
            }

            var quizEntity = await QuizMappers.CreateQuiz(quiz);
            var createdQuiz = await _quizRepository.Add(quizEntity);

            // await _hubContext.Clients.All.SendAsync("ReceiveNewQuiz", createdQuiz.Category, createdQuiz.Title);

            return createdQuiz;
        }
        public async Task<Quiz?> GetQuizByIdAsync(string id)
        {
            var quiz = await _quizRepository.GetById(id);
            return quiz;
        }

        public async Task<IEnumerable<Quiz>> GetAllQuizzesAsync()
        {
            return await _quizRepository.GetAll();
        }

        public async Task<Quiz> DeleteQuizAsync(string id)
        {
            var quiz = await _quizRepository.GetById(id);
            if (quiz != null)
            {
                return await _quizRepository.Delete(quiz);
            }
            throw new KeyNotFoundException("Quiz not found");
        }

        public async Task<IEnumerable<Quiz>> GetQuizzesByTeacherEmailAsync(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                throw new ArgumentException("Email cannot be null or empty", nameof(email));
            }
            var quizzes = await _quizRepository.GetAll();
            foreach (var quiz in quizzes)
            {
                var allQuestions = await _questionRepository.GetAll();
                quiz.Questions = allQuestions.Where(q => q.QuizId == quiz.Id).ToList();
                foreach (var question in quiz.Questions)
                {
                    var allOptions = await _optionRepository.GetAll();
                    question.Options = allOptions.Where(o => o.QuestionId == question.Id).ToList();
                }
            }

            return quizzes.Where(q => q.UploadedBy == email);
        }

        public async Task<IEnumerable<Quiz>> GetAndSearchWithLimit(string? searchTerm = "", int limit = 10, int skip = 0, string? category = "")
        {
            if (string.IsNullOrEmpty(searchTerm))
                searchTerm = string.Empty;

            if (string.IsNullOrEmpty(category))
                category = string.Empty;

            if (limit <= 0) limit = 10;

            if (skip < 0) skip = 0;

            var quizzes = await _quizRepository.GetAll();
            return quizzes.Where(q => (q.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                                      q.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)) && (q.Category.ToLower() == category.ToLower() || string.IsNullOrEmpty(category)))
                          .OrderByDescending(q => q.CreatedAt)
                          .Skip(skip)
                          .Take(limit);
        }

        public async Task<Question> UpdateQuestionAsync(string id, UpdateQuestionRequestDTO dto)
        {
            var question = await _questionRepository.GetById(id);
            if (question == null)
                throw new Exception("Question not found");

            // Update question properties
            if (!string.IsNullOrWhiteSpace(dto.QuestionText))
                question.QuestionText = dto.QuestionText;

            question.Mark = dto.Mark;

            if (dto.Options != null && dto.Options.Count > 0)
            {
                foreach (var optionDto in dto.Options)
                {
                    if (string.IsNullOrEmpty(optionDto.Id))
                        continue;

                    var option = await _optionRepository.GetById(optionDto.Id);
                    if (option != null && option.QuestionId == id)
                    {
                        if (!string.IsNullOrWhiteSpace(optionDto.OptionText))
                            option.OptionText = optionDto.OptionText;

                        option.IsCorrect = optionDto.IsCorrect;

                        await _optionRepository.Update(option.Id, option);
                    }
                }
            }

            await _questionRepository.Update(question.Id, question);

            return await _questionRepository.Update(question.Id, question);
        }

    }
}