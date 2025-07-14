namespace QuizApp.Models
{
    public class Quiz
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string UploadedBy { get; set; } = string.Empty; // Teacher ID
        public Teacher? Teacher { get; set; }
        public int TotalMarks { get; set; }
        public TimeSpan TimeLimit { get; set; }
        public ICollection<Question>? Questions { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }

}