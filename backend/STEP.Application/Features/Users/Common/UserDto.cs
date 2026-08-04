namespace STEP.Application.Features.Users.Common
{
    public record UserDto(
        int Id,
        string EmployeeCode,
        string FirstName,
        string LastName,
        string Email,
        string Role,
        string? Department,
        string Status);
}
