using System;

namespace STEP.Application.Features.V2.Exams.Commands.GenerateTempExamPass
{
    public record TempExamPassDto(
        string CandidateCode,
        string Passcode,
        string CandidateName,
        string RoleName,
        string ExamUrl,
        DateTime ExpiresAtUtc,
        int ValidityHours
    );
}
