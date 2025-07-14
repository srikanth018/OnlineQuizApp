using System.Threading.Tasks;
using QuizApp.DTOs;
using QuizApp.Misc;
using QuizApp.Models;

namespace QuizApp.Mappers
{
    public static class QuizMappers
    {
        private static Option CreateOption(string questionId, CreateOptionDTO request)
        {
            Option option = new();
            option.Id = Generators.GenerateID("OP");
            option.OptionText = request.OptionText;
            option.IsCorrect = request.IsCorrect;
            option.QuestionId = questionId;
            return option;
        }
        private static async Task<Question> CreateQuestion(string quizId, CreateQuestionDTO request)
        {
            Question question = new();
            question.Id = Generators.GenerateID("QU");
            question.QuestionText = request.QuestionText;
            question.QuizId = quizId;
            question.Mark = request.Mark;
            question.CreatedAt = DateTime.UtcNow;
            question.Options = new List<Option>();
            foreach (var optionRequest in request.Options)
            {
                Option option = CreateOption(question.Id, optionRequest);
                question.Options.Add(option);
            }
            if (request.Image is not null)
            {
                question.UploadImage = new QuestionImage
                {
                    Id = Generators.GenerateID("IM"),
                    Title = request.Image.FileName,
                    ImageUrl = await Generators.GenerateImageFilePath(request.Image),
                    CreatedAt = DateTime.UtcNow
                };
            }
            else
            {
                question.UploadImage = null;
            }
            return question;
        }
        public static async Task<Quiz> CreateQuiz(CreateQuizRequestDTO request)
        {
            Quiz quiz = new();
            quiz.Id = Generators.GenerateID("QI");
            quiz.Title = request.Title;
            quiz.Description = request.Description;
            quiz.TimeLimit = request.TimeLimit;
            quiz.Category = request.Category;
            quiz.UploadedBy = request.UploadedBy;
            quiz.TotalMarks = request.TotalMarks;
            quiz.Questions = new List<Question>();
            foreach (var questionRequest in request.Questions)
            {
                Question question = await CreateQuestion(quiz.Id, questionRequest);
                quiz.Questions.Add(question);
            }
            return quiz;
        }
    }
}

