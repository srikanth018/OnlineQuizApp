using QuizApp.Interfaces;
using QuizApp.Models;

namespace QuizApp.Services
{
    public class UserService : IUserService
    {
        private readonly IRepository<string,User> _userRepository;

        public UserService(IRepository<string,User> userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            return await _userRepository.GetById(id);
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _userRepository.GetAll();
        }
    }
}