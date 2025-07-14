namespace QuizApp.Models
{
    public class User
    {
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public Teacher? Teacher { get; set; }
        public Student? Student { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}