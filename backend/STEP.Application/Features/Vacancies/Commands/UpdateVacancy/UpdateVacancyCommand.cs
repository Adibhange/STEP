using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Vacancies.Common;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Application.Features.Vacancies.Commands.UpdateVacancy
{
    public record UpdateVacancyCommand(
        int VacancyId,
        string Title,
        string Status,
        string? JobDescription,
        decimal MinExperienceYears,
        decimal MaxExperienceYears
    ) : IRequest<VacancyDto>;

    public class UpdateVacancyCommandHandler(IApplicationDbContext db)
        : IRequestHandler<UpdateVacancyCommand, VacancyDto>
    {
        public async Task<VacancyDto> Handle(UpdateVacancyCommand request, CancellationToken cancellationToken)
        {
            var vacancy = await db.Vacancies
                .Include(v => v.MasterRole)
                .Include(v => v.Department)
                .Include(v => v.HiringLocation)
                .Include(v => v.EmploymentType)
                .Include(v => v.PipelineFlows).ThenInclude(f => f.Rounds)
                .Include(v => v.AssessmentSections)
                .FirstOrDefaultAsync(v => v.Id == request.VacancyId, cancellationToken)
                ?? throw new NotFoundException(nameof(Vacancy), request.VacancyId);

            vacancy.Title = request.Title;
            vacancy.Status = request.Status;
            vacancy.JobDescription = request.JobDescription;
            vacancy.MinExperienceYears = request.MinExperienceYears;
            vacancy.MaxExperienceYears = request.MaxExperienceYears;

            await db.SaveChangesAsync(cancellationToken);

            return new VacancyDto(
                vacancy.Id,
                vacancy.VacancyCode,
                vacancy.Title,
                vacancy.MasterRole?.Name ?? "N/A",
                vacancy.Department?.Name ?? "N/A",
                vacancy.HiringLocation?.Name ?? "N/A",
                vacancy.EmploymentType?.Name ?? "N/A",
                vacancy.DriveType,
                vacancy.Status,
                vacancy.WorkMode,
                vacancy.TotalOpenings,
                vacancy.MinExperienceYears,
                vacancy.MaxExperienceYears,
                vacancy.JobDescription,
                vacancy.ClosingDate,
                vacancy.WalkinDriveDate,
                [vacancy.HiringLocation?.Name ?? "N/A"],
                vacancy.PipelineFlows.Select(f => new PipelineFlowDto(
                    f.Id, f.VersionName, f.Description, f.IsDefault,
                    f.Rounds.OrderBy(r => r.RoundOrder).Select(r => new PipelineRoundDto(r.Id, r.RoundOrder, r.Name, r.RoundType, r.CutoffPercent)).ToList()
                )).ToList(),
                vacancy.AssessmentSections.OrderBy(s => s.SectionOrder).Select(s => new AssessmentSectionDto(
                    s.Id, s.SectionOrder, s.SectionTitle, s.TotalQuestions, s.TimeLimitMinutes, s.MarksPerQuestion, s.TotalMarks
                )).ToList());
        }
    }
}
