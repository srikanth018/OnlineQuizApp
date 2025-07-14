using QuizApp.DTOs;
using QuizApp.Models;

namespace QuizApp.Mappers
{
    public static class AttemptQuizMapper
    {
        public static AttemptQuizResponseDTO MapToAttemptQuizResponseDTO(Quiz quiz)
        {
            return new AttemptQuizResponseDTO
            {
                QuizId = quiz.Id,
                Title = quiz.Title,
                TimeLimit = quiz.TimeLimit,
                Questions = (quiz.Questions ?? new List<Question>()).Select(q => new QuestionForAttemptDTO
                {
                    QuestionId = q.Id,
                    QuestionText = q.QuestionText,
                    Options = (q.Options ?? new List<Option>()).Select(o => new OptionForAttemptDTO
                    {
                        OptionId = o.Id,
                        OptionText = o.OptionText
                    }).ToList()
                }).ToList()
            };
        }
    }
}