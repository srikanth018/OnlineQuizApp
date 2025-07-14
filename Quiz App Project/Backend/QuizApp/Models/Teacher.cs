namespace QuizApp.Models
{
    public class Teacher
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public User? User { get; set; }
        public ICollection<Quiz>? Quizzes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}