namespace QuizApp.DTOs
{
    public class StudentUpdateRequestDto
    {
        public string? Name { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? HighestQualification { get; set; }
        public string? Status { get; set; }
    }

}