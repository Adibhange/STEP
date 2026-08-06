namespace STEP.Application.Common.Interfaces
{
    /// <summary>
    /// Application-layer view of "who is making this request" — implemented in STEP.Api against
    /// the JWT claims on the current HTTP context, so query/command handlers can branch on the
    /// caller's identity/role without taking a dependency on ASP.NET Core.
    /// </summary>
    public interface ICurrentUserService
    {
        int? UserId { get; }
        string? Role { get; }
    }
}
