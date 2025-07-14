namespace QuizApp.DTOs
{
    public class SubmitQuizRequestDTO
    {
        public string QuizId { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        public List<SubmitQuestionDTO> Questions { get; set; } = new();
        public DateTime StartedAt { get; set; }
        public DateTime EndedAt { get; set; }
        public int NegativePoints { get; set; } 
    }

    public class SubmitQuestionDTO
    {
        public string QuestionId { get; set; } = string.Empty;
        public List<string> SelectedOptionIds { get; set; } = new();
    }
}
