using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Vacancies.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Master;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Application.Features.Vacancies.Commands.CreateVacancy
{
    public class CreateVacancyCommandHandler(IApplicationDbContext db) : IRequestHandler<CreateVacancyCommand, VacancyDto>
    {
        public async Task<VacancyDto> Handle(CreateVacancyCommand request, CancellationToken cancellationToken)
        {
            var masterRole = await db.MasterRoles.FirstOrDefaultAsync(r => r.Id == request.MasterRoleId, cancellationToken)
                ?? throw new NotFoundException(nameof(MasterRole), request.MasterRoleId);
            var department = await db.MasterDepartments.FirstOrDefaultAsync(d => d.Id == request.DepartmentId, cancellationToken)
                ?? throw new NotFoundException(nameof(MasterDepartment), request.DepartmentId);
            var hiringLocation = await db.MasterHiringLocations.FirstOrDefaultAsync(l => l.Id == request.HiringLocationId, cancellationToken)
                ?? throw new NotFoundException(nameof(MasterHiringLocation), request.HiringLocationId);
            var employmentType = await db.MasterEmploymentTypes.FirstOrDefaultAsync(e => e.Id == request.EmploymentTypeId, cancellationToken)
                ?? throw new NotFoundException(nameof(MasterEmploymentType), request.EmploymentTypeId);

            var testLocations = await db.MasterTestLocations
                .Where(t => request.TestLocationIds.Contains(t.Id))
                .ToListAsync(cancellationToken);
            if (testLocations.Count != request.TestLocationIds.Distinct().Count())
            {
                throw new NotFoundException(nameof(MasterTestLocation), string.Join(",", request.TestLocationIds));
            }

            var nextSequence = await db.Vacancies.IgnoreQueryFilters().CountAsync(cancellationToken) + 101;
            var vacancyCode = $"VAC-{DateTime.UtcNow:yyyy}-{nextSequence}";

            var vacancy = new VacancyEntity
            {
                VacancyCode = vacancyCode,
                Title = request.Title.Trim(),
                MasterRoleId = request.MasterRoleId,
                DepartmentId = request.DepartmentId,
                HiringLocationId = request.HiringLocationId,
                EmploymentTypeId = request.EmploymentTypeId,
                DriveType = request.DriveType,
                WorkMode = request.WorkMode,
                Status = request.Status,
                TotalOpenings = request.TotalOpenings,
                MinExperienceYears = request.MinExperienceYears,
                MaxExperienceYears = request.MaxExperienceYears,
                JobDescription = request.JobDescription,
                ClosingDate = request.ClosingDate,
                WalkinDriveDate = request.WalkinDriveDate,
                WalkinStartTime = request.WalkinStartTime,
                WalkinEndTime = request.WalkinEndTime,
                AssignedRecruiterId = request.AssignedRecruiterId,
                HiringManagerId = request.HiringManagerId,
            };

            foreach (var loc in testLocations)
            {
                vacancy.TestLocations.Add(new VacancyTestLocation { MasterTestLocationId = loc.Id });
            }

            foreach (var flow in request.PipelineFlows)
            {
                var flowEntity = new VacancyPipelineFlow
                {
                    VersionName = flow.VersionName,
                    Description = flow.Description,
                    IsDefault = flow.IsDefault,
                };

                foreach (var round in flow.Rounds.OrderBy(r => r.RoundOrder))
                {
                    flowEntity.Rounds.Add(new VacancyPipelineFlowRound
                    {
                        RoundOrder = round.RoundOrder,
                        Name = round.Name,
                        RoundType = round.RoundType,
                        CutoffPercent = round.CutoffPercent,
                    });
                }
                STEP.Application.Common.PipelineFlowRoundDefaults.EnsureEndsWithDirectorRound(flowEntity.Rounds);

                vacancy.PipelineFlows.Add(flowEntity);
            }

            foreach (var section in request.AssessmentSections)
            {
                vacancy.AssessmentSections.Add(new VacancyAssessmentSection
                {
                    SectionOrder = section.SectionOrder,
                    SectionTitle = section.SectionTitle,
                    TotalQuestions = section.TotalQuestions,
                    TimeLimitMinutes = section.TimeLimitMinutes,
                    MarksPerQuestion = section.MarksPerQuestion,
                    TotalMarks = section.TotalQuestions * section.MarksPerQuestion,
                });
            }

            db.Vacancies.Add(vacancy);

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                Action = "CreateVacancy",
                EntityName = nameof(VacancyEntity),
                EntityId = vacancyCode,
            });

            await db.SaveChangesAsync(cancellationToken);

            return new VacancyDto(
                vacancy.Id,
                vacancy.VacancyCode,
                vacancy.Title,
                masterRole.Name,
                department.Name,
                hiringLocation.Name,
                employmentType.Name,
                vacancy.DriveType,
                vacancy.Status,
                vacancy.WorkMode,
                vacancy.TotalOpenings,
                vacancy.MinExperienceYears,
                vacancy.MaxExperienceYears,
                vacancy.JobDescription,
                vacancy.ClosingDate,
                vacancy.WalkinDriveDate,
                testLocations.Select(t => t.Name).ToList(),
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
