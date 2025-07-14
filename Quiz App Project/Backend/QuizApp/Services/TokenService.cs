using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using QuizApp.Interfaces;
using QuizApp.Models;

namespace QuizApp.Services
{
    public class TokenService : ITokenService
    {
        private readonly SymmetricSecurityKey _securityKey;

        public TokenService(IConfiguration configuration)
        {
            var jwtTokenKey = configuration["Keys:JwtTokenKey"];
            if (string.IsNullOrEmpty(jwtTokenKey))
            {
                throw new ArgumentNullException("JwtTokenKey configuration value is missing.");
            }
            _securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtTokenKey));

        }
        public Task<string> GenerateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var creds = new SigningCredentials(_securityKey, SecurityAlgorithms.HmacSha256Signature);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };
            var tokenHandler = new JwtSecurityTokenHandler();

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return Task.FromResult(tokenHandler.WriteToken(token));
        }
    }
}