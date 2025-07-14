namespace QuizApp.Models
{
    public class Question
    {
        public string Id { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public string QuizId { get; set; } = string.Empty;
        public Quiz? Quiz { get; set; }
        public ICollection<Option>? Options { get; set; }
        public int Mark { get; set; }
        public QuestionImage? UploadImage { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}