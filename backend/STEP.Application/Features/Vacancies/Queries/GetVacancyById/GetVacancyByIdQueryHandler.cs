using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Vacancies.Common;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;

namespace STEP.Application.Features.Vacancies.Queries.GetVacancyById
{
    public class GetVacancyByIdQueryHandler(IApplicationDbContext db) : IRequestHandler<GetVacancyByIdQuery, VacancyDto>
    {
        public async Task<VacancyDto> Handle(GetVacancyByIdQuery request, CancellationToken cancellationToken)
        {
            var vacancy = await db.Vacancies
                .Include(v => v.MasterRole)
                .Include(v => v.Department)
                .Include(v => v.HiringLocation)
                .Include(v => v.EmploymentType)
                .Include(v => v.TestLocations).ThenInclude(t => t.MasterTestLocation)
                .Include(v => v.PipelineFlows).ThenInclude(f => f.Rounds)
                .Include(v => v.AssessmentSections)
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.Id == request.Id, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyEntity), request.Id);

            // "Assigned candidates" per flow = distinct candidates with a pipeline-progress row on
            // one of that flow's rounds (set by AssignPipelineFlowCommand) — there's no direct
            // Candidate -> VacancyPipelineFlow foreign key, only the round-level trail.
            var roundToFlowId = vacancy.PipelineFlows
                .SelectMany(f => f.Rounds.Select(r => new { r.Id, FlowId = f.Id }))
                .ToDictionary(x => x.Id, x => x.FlowId);
            var roundIds = roundToFlowId.Keys.ToList();

            // EF Core translates an empty `roundIds` (e.g. a brand-new vacancy with no rounds yet)
            // to a filter that simply matches nothing — no special-casing needed here.
            var progressRows = await db.CandidatePipelineProgresses
                .Where(p => roundIds.Contains(p.VacancyPipelineFlowRoundId))
                .Select(p => new { p.CandidateId, p.VacancyPipelineFlowRoundId })
                .ToListAsync(cancellationToken);

            var assignedCountByFlow = progressRows
                .GroupBy(p => roundToFlowId[p.VacancyPipelineFlowRoundId])
                .ToDictionary(g => g.Key, g => g.Select(p => p.CandidateId).Distinct().Count());

            return new VacancyDto(
                vacancy.Id,
                vacancy.VacancyCode,
                vacancy.Title,
                vacancy.MasterRole.Name,
                vacancy.Department.Name,
                vacancy.HiringLocation.Name,
                vacancy.EmploymentType.Name,
                vacancy.DriveType,
                vacancy.Status,
                vacancy.WorkMode,
                vacancy.TotalOpenings,
                vacancy.MinExperienceYears,
                vacancy.MaxExperienceYears,
                vacancy.JobDescription,
                vacancy.ClosingDate,
                vacancy.WalkinDriveDate,
                vacancy.TestLocations.Select(t => t.MasterTestLocation.Name).ToList(),
                vacancy.PipelineFlows.Select(f => new PipelineFlowDto(
                    f.Id, f.VersionName, f.Description, f.IsDefault,
                    f.Rounds.OrderBy(r => r.RoundOrder).Select(r => new PipelineRoundDto(r.Id, r.RoundOrder, r.Name, r.RoundType, r.CutoffPercent)).ToList(),
                    assignedCountByFlow.GetValueOrDefault(f.Id, 0)
                )).ToList(),
                vacancy.AssessmentSections.OrderBy(s => s.SectionOrder).Select(s => new AssessmentSectionDto(
                    s.Id, s.SectionOrder, s.SectionTitle, s.TotalQuestions, s.TimeLimitMinutes, s.MarksPerQuestion, s.TotalMarks
                )).ToList());
        }
    }
}
