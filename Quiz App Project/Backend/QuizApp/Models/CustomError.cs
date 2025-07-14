namespace QuizApp.Models
{
    public class CustomError
    {


        public string Message { get; set; } = string.Empty;
        public int StatusCode { get; set; }
        public Guid ErrorId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


    }
}