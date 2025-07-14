namespace QuizApp.DTOs
{
    public class AttemptQuizResponseDTO
    {
        public string QuizId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public TimeSpan TimeLimit { get; set; }
        public List<QuestionForAttemptDTO> Questions { get; set; } = new();
    }

    public class QuestionForAttemptDTO
    {
        public string QuestionId { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public List<OptionForAttemptDTO> Options { get; set; } = new();
    }

    public class OptionForAttemptDTO
    {
        public string OptionId { get; set; } = string.Empty;
        public string OptionText { get; set; } = string.Empty;
    }
}
