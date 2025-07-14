namespace QuizApp.Models
{
    public class Option
    {
        public string Id { get; set; } = string.Empty;
        public string OptionText { get; set; } = string.Empty;
        public string QuestionId { get; set; } = string.Empty;
        public Question? question { get; set; }
        public bool IsCorrect { get; set; }
    }
}