namespace QuizApp.Interfaces
{
    public interface IQuizTemplateService
    {
        byte[] GenerateQuizTemplate(int questionCount, int optionCount = 4);
    }
}