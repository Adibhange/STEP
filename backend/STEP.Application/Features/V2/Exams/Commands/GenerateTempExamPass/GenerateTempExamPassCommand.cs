using MediatR;

namespace STEP.Application.Features.V2.Exams.Commands.GenerateTempExamPass
{
    public record GenerateTempExamPassCommand(
        string CandidateName,
        string Email,
        string Phone,
        int? VacancyId,
        int? MasterRoleId,
        int ValidityHours = 24
    ) : IRequest<TempExamPassDto>;
}
