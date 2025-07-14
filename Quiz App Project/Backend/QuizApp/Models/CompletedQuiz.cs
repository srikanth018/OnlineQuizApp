namespace QuizApp.Models
{
    public class CompletedQuiz
    {
        public string Id { get; set; } = string.Empty;
        public int TotalScore { get; set; }
        public string StudentEmail { get; set; } = string.Empty;
        public string QuizId { get; set; } = string.Empty;
        public Student? Student { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime EndedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int CreditPoints { get; set; } 
    }
}