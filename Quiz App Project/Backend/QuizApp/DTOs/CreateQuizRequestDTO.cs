namespace QuizApp.DTOs
{
    public class CreateQuizRequestDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string UploadedBy { get; set; } = string.Empty;
        public int TotalMarks { get; set; }
        public TimeSpan TimeLimit { get; set; }
        public List<CreateQuestionDTO> Questions { get; set; } = new();
    }

    public class CreateQuestionDTO
    {
        public string QuestionText { get; set; } = string.Empty;
        public int Mark { get; set; }
        public IFormFile? Image { get; set; }
        public List<CreateOptionDTO> Options { get; set; } = new();

    }

    public class CreateOptionDTO
    {
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}
