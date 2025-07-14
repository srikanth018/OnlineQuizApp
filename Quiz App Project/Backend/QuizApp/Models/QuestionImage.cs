namespace QuizApp.Models
{
    public class QuestionImage
    {
        public string Id { get; set; } = string.Empty;
        public string QuestionId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;  // Path to the uploaded file
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Question? Question { get; set; }
    }
}
