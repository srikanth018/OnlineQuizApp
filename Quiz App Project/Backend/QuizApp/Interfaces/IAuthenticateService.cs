using QuizApp.DTOs;

namespace QuizApp.Interfaces
{ 
    public interface IAuthenticateService
    {
        Task<UserLoginResponseDTO> Login(UserLoginRequestDTO user);
    }
}