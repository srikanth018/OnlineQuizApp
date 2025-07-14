using QuizApp.DTOs;
using QuizApp.Interfaces;
using QuizApp.Misc;
using QuizApp.Models;

namespace QuizApp.Services
{
    public class AuthenticationService : IAuthenticateService
    {
        private readonly ITokenService _tokenService;
        private readonly IRepository<string, User> _userRepository;
        private readonly ITeacherService _teacherService;

        public AuthenticationService(ITokenService tokenService, IRepository<string, User> userRepository, ITeacherService teacherService)
        {
            _tokenService = tokenService;
            _userRepository = userRepository;
            _teacherService = teacherService;
        }

        public async Task<UserLoginResponseDTO> Login(UserLoginRequestDTO userResponse)
        {
            var existingUser = await _userRepository.GetById(userResponse.Email);
            if (existingUser == null)
            {
                throw new KeyNotFoundException($"User with email {userResponse.Email} not found for login.");
            }
            var isValidPassword = Generators.VerifyPassword(userResponse.Password, existingUser.Password);
            if (!isValidPassword)
            {
                throw new InvalidOperationException("Invalid password.");
            }
            if (existingUser.Role == "Teacher")
            {
                var teacher = await _teacherService.GetByEmailAsync(userResponse.Email);
                if (teacher == null)
                {
                    throw new KeyNotFoundException($"Teacher with email {userResponse.Email} not found for login.");
                }
                existingUser.Teacher = teacher;
            }
            else if (existingUser.Role == "Student")
            {
                
            }

            var token = await _tokenService.GenerateToken(existingUser);
            return new UserLoginResponseDTO
            {
                Token = token,
                Email = existingUser.Email,
            };
        }
    }
}