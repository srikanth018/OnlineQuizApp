namespace QuizApp.DTOs
{
    public class UpdateQuestionRequestDTO
    {
        public string? QuestionText { get; set; }
        public int Mark { get; set; }
        public List<UpdateOptionRequestDTO>? Options { get; set; }
    }

    public class UpdateOptionRequestDTO
    {
        public string? Id { get; set; }
        public string? OptionText { get; set; }
        public bool IsCorrect { get; set; }
    }
}