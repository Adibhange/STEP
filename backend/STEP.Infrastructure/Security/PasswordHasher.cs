using STEP.Application.Common.Interfaces;

namespace STEP.Infrastructure.Security
{
    public class PasswordHasher : IPasswordHasher
    {
        public string Hash(string plainText) => BCrypt.Net.BCrypt.HashPassword(plainText);

        public bool Verify(string plainText, string hash)
        {
            if (string.IsNullOrEmpty(hash))
            {
                return false;
            }

            return BCrypt.Net.BCrypt.Verify(plainText, hash);
        }
    }
}
