using System.Threading.Tasks;
using BCrypt.Net;
using ClosedXML.Excel;
using QuizApp.DTOs;
using QuizApp.Models;

namespace QuizApp.Misc
{
    public static class Generators
    {
        private static readonly Random _random = new Random();

        public static string GenerateID(string prefix)
        {
            long timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            int random = new Random().Next(0, 65536);
            return $"{prefix}{timestamp:X8}{random:X4}";
        }


        public static string GenerateHashedPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Password cannot be null or empty");

            return BCrypt.Net.BCrypt.HashPassword(password);
        }
        public static bool VerifyPassword(string password, string hashedPassword)
        {
            if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hashedPassword))
                throw new ArgumentException("Password and hashed password cannot be null or empty");

            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }

        private static async Task<string> UploadImageAsync(IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
                throw new ArgumentException("Invalid image file");
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Questions");

            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}_{imageFile.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(stream);
            }

            // Return relative path for public URL (served via wwwroot)
            return $"/uploads/questions/{fileName}";
        }

        public static async Task<string> GenerateImageFilePath(IFormFile imageFile)
        {
            if (imageFile == null || string.IsNullOrWhiteSpace(imageFile.FileName))
                throw new ArgumentException("Image file cannot be null or empty");

            return await UploadImageAsync(imageFile);
        }

        public static CreateQuizRequestDTO ParseQuizFromWorksheet(FileUploadDTO filedata, IXLWorksheet worksheet)
        {
            Console.WriteLine("Parsing quiz from worksheet");
            var formatErrors = new List<string>();
            var submissionErrors = new List<string>();
            var quiz = new CreateQuizRequestDTO
            {
                Title = filedata.Title,
                Description = filedata.Description,
                TimeLimit = filedata.TimeLimit,
                Category = filedata.Category,
                UploadedBy = filedata.UploadedBy,
                TotalMarks = filedata.TotalMarks,
                Questions = new List<CreateQuestionDTO>()
            };

            int optionStartCol = 3;

            foreach (var row in worksheet.RowsUsed().Skip(1))
            {
                var rowNumber = row.RowNumber();

                if (string.IsNullOrWhiteSpace(row.Cell(1).GetValue<string>()))
                    formatErrors.Add($"Question text in row {rowNumber} cannot be empty");

                if (string.IsNullOrWhiteSpace(row.Cell(2).GetValue<string>()))
                    formatErrors.Add($"Question mark in row {rowNumber} cannot be empty");

                else if (!int.TryParse(row.Cell(2).GetValue<string>(), out int mark) || mark <= 0)
                    formatErrors.Add($"Question mark in row {rowNumber} must be a positive integer");

                for (int i = 3; i <= 9; i += 2)
                {
                    if (string.IsNullOrWhiteSpace(row.Cell(i).GetValue<string>()))
                        formatErrors.Add($"Option text in column  Option{rowNumber-i+2} (row {rowNumber}) cannot be empty");
                }

                for (int i = 4; i <= 10; i += 2)
                {
                    var cellValue = row.Cell(i).GetValue<string>()?.ToLower();
                    if (string.IsNullOrWhiteSpace(cellValue))
                    {
                        formatErrors.Add($"IsCorrect{rowNumber-i+3} in row {rowNumber} cannot be empty");
                    }
                    else if (cellValue != "true" && cellValue != "false")
                    {
                        formatErrors.Add($"IsCorrect{rowNumber-i+3} in row {rowNumber} must be either 'true' or 'false'");
                    }
                }
            }

            if (formatErrors.Any())
                throw new ArgumentException("FORMAT_ERRORS: " + string.Join(", ", formatErrors));

            foreach (var row in worksheet.RowsUsed().Skip(1))
            {
                var question = new CreateQuestionDTO
                {
                    QuestionText = row.Cell(1).GetValue<string>(),
                    Mark = row.Cell(2).GetValue<int>(),
                    Options = new List<CreateOptionDTO>()
                };

                for (int i = optionStartCol; i <= 9; i += 2)
                {
                    var optionText = row.Cell(i).GetValue<string>();
                    var isCorrect = bool.Parse(row.Cell(i + 1).GetValue<string>().ToLower());

                    if (!string.IsNullOrWhiteSpace(optionText))
                    {
                        question.Options.Add(new CreateOptionDTO
                        {
                            OptionText = optionText,
                            IsCorrect = isCorrect
                        });
                    }
                }

                quiz.Questions.Add(question);
            }

            if (!quiz.Questions.Any())
                submissionErrors.Add("Quiz must have at least one question");

            foreach (var q in quiz.Questions.Select((val, index) => new { val, index }))
            {
                var qIndex = q.index + 2;
                if (!q.val.Options.Any(o => o.IsCorrect))
                    submissionErrors.Add($"Question in row {qIndex} must have at least one correct option");

                if (q.val.Mark <= 0)
                    submissionErrors.Add($"Question in row {qIndex} must have a positive mark");
            }

            var questionsTotalMarks = quiz.Questions.Sum(q => q.Mark);
            if (questionsTotalMarks != filedata.TotalMarks)
                submissionErrors.Add($"Total marks of questions do not match the provided total marks ({filedata.TotalMarks}). Your Current Total Marks: {questionsTotalMarks}");

            if (submissionErrors.Any())
                throw new ArgumentException("SUBMISSION_ERRORS: " + string.Join(", ", submissionErrors));

            return quiz;
        }

        public static int GenerateTotalMarksSecured(SubmitQuizRequestDTO submitedQuiz, Quiz quiz)
        {
            if (submitedQuiz == null)
                throw new ArgumentException("Quiz or questions cannot be null or empty");

            int TotalMarksSecured = 0;

            foreach (var question in submitedQuiz.Questions)
            {
                var quizQuestion = quiz.Questions?.FirstOrDefault(q => q.Id == question.QuestionId);
                if (quizQuestion != null)
                {
                    var correctOptions = quizQuestion.Options?.Where(o => o.IsCorrect).Select(o => o.Id).ToList();
                    if (correctOptions != null && question.SelectedOptionIds.All(id => correctOptions.Contains(id)))
                    {
                        TotalMarksSecured += quizQuestion.Mark;
                    }
                }
            }
            return TotalMarksSecured;
        }

        public static int GenerateCreditPoints(int totalMarksSecured, int totalMarks, int negativePoint = 0)
        {
            if (totalMarksSecured < 0)
                throw new ArgumentException("Total marks secured cannot be negative");

            if (negativePoint < 0)
                throw new ArgumentException("Negative mark cannot be negative");

            if (totalMarksSecured < 0)
                totalMarksSecured = 0;

            if (totalMarks <= 0)
                return 0;

            if (totalMarks <= 0)
                throw new ArgumentException("Total marks must be greater than zero");

            double percentage = (double)totalMarksSecured / totalMarks * 100;
            int creditPoints = (int)Math.Round(percentage / 10);
            creditPoints -= negativePoint;
            return creditPoints;
        }
    }
}