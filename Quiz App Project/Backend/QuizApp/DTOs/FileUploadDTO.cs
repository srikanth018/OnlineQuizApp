namespace QuizApp.DTOs
{
    public class FileUploadDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string UploadedBy { get; set; } = string.Empty;
        public int TotalMarks { get; set; }
        public TimeSpan TimeLimit { get; set; }
        public IFormFile File { get; set; } = null!;
    }
}