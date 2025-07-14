using QuizApp.DTOs;
using QuizApp.Interfaces;
using QuizApp.Mappers;
using QuizApp.Misc;
using QuizApp.Models;

namespace QuizApp.Services
{
    public class AttemptQuizService : IAttemptQuizService
    {
        private readonly IRepository<string, Quiz> _quizRepository;
        private readonly IRepository<string, CompletedQuiz> _completedQuizRepository;
        public AttemptQuizService(IRepository<string, Quiz> quizRepository, IRepository<string, CompletedQuiz> completedQuizRepository)
        {
            _quizRepository = quizRepository;
            _completedQuizRepository = completedQuizRepository;
        }

        public async Task<AttemptQuizResponseDTO> AttemptQuizAsync(string quizId)
        {
            var quiz = await _quizRepository.GetById(quizId);
            if (quiz == null)
            {
                throw new KeyNotFoundException("Quiz not found");
            }
            var response = AttemptQuizMapper.MapToAttemptQuizResponseDTO(quiz);
            return response;
        }

        public async Task<CompletedQuiz> SubmitQuizAsync(SubmitQuizRequestDTO request)
        {
            Console.WriteLine($"Submitting quiz for Quiz ID: {request.QuizId}");
            var quiz = await _quizRepository.GetById(request.QuizId);
            if (quiz == null)
            {
                throw new KeyNotFoundException("Quiz not found");
            }
            var TotalMarksSecured = Generators.GenerateTotalMarksSecured(request, quiz);
            var CompletedQuiz = CompletedQuizMapper.MapToCompletedQuiz(request, TotalMarksSecured);
            CompletedQuiz.CreditPoints = Generators.GenerateCreditPoints(TotalMarksSecured, quiz.TotalMarks, request.NegativePoints);
            await _completedQuizRepository.Add(CompletedQuiz);
            return CompletedQuiz;
        }
    }
}