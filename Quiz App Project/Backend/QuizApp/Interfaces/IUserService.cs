using QuizApp.Models;

namespace QuizApp.Interfaces
{ 
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(string id);
        Task<IEnumerable<User>> GetAllUsersAsync();

    }
}