using QuizApp.Models;

namespace QuizApp.Interfaces
{
    public interface ITokenService
    {
        Task<string> GenerateToken(User user);
    }
}