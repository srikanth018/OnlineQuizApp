namespace QuizApp.DTOs
{
    public class UserLoginResponseDTO
    {
        public string Email { get; set; } = string.Empty;
        public string? Token { get; set; }
    }
}