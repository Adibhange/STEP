using System;

namespace STEP.Application.Common.Exceptions
{
    /// <summary>Invalid credentials, invalid PIN, or inactive/locked-out account.</summary>
    public class AuthenticationFailedException : Exception
    {
        public AuthenticationFailedException(string message) : base(message)
        {
        }
    }
}
