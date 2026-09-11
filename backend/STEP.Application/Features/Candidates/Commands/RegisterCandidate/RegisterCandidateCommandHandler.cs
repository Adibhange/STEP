using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Services;
using STEP.Application.Features.Candidates.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Candidate;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.Candidates.Commands.RegisterCandidate
{
    public class RegisterCandidateCommandHandler(IApplicationDbContext db, IPipelineInitializationService pipelineService) : IRequestHandler<RegisterCandidateCommand, CandidateDto>
    {
        public async Task<CandidateDto> Handle(RegisterCandidateCommand request, CancellationToken cancellationToken)
        {
            var vacancy = await db.Vacancies
                .Include(v => v.PipelineFlows).ThenInclude(f => f.Rounds)
                .Include(v => v.MasterRole)
                .Include(v => v.AssessmentBlueprint)
                .FirstOrDefaultAsync(v => v.Id == request.VacancyId, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyEntity), request.VacancyId);

            var isDirectHiring = CandidatePipelineHelper.IsDirectDrive(false, vacancy.DriveType);
            var channel = !string.IsNullOrWhiteSpace(request.RegistrationChannel) ? request.RegistrationChannel : (isDirectHiring ? "Direct Sourced" : "Walk-in");

            var candidate = new CandidateEntity
            {
                CandidateCode = $"TMP-{Guid.NewGuid().ToString("N")[..16]}",
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = request.Email?.Trim() ?? string.Empty,
                Phone = request.Phone.Trim(),
                VacancyId = request.VacancyId,
                CurrentStage = isDirectHiring ? "Round 1: HR Sourcing & Screening (Auto-Passed)" : "Registered",
                Status = "Applied",
                RegistrationChannel = channel,
                ReferralEmployeeName = request.ReferralEmployeeName,
                TotalExperienceYears = request.TotalExperienceYears,
                CurrentCTC = request.CurrentCTC,
                ExpectedCTC = request.ExpectedCTC,
                NoticePeriodDays = request.NoticePeriodDays,
                CurrentLocation = request.CurrentLocation,
                HighestQualification = request.HighestQualification,
            };

            db.Candidates.Add(candidate);
            await db.SaveChangesAsync(cancellationToken);

            // Assign clean sequential candidate code based on auto-incrementing DB Id (e.g. CND-2026-0001, CND-2026-0002)
            candidate.CandidateCode = $"CND-{DateTime.UtcNow:yyyy}-{candidate.Id:D4}";

            var pipelineProgressList = await pipelineService.InitializeCandidatePipelineAsync(
                candidate,
                vacancy,
                isDirectHiring,
                cancellationToken);

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                Action = "RegisterCandidate",
                EntityName = nameof(CandidateEntity),
                EntityId = candidate.CandidateCode,
            });

            await db.SaveChangesAsync(cancellationToken);
            return new CandidateDto(
                candidate.Id, candidate.CandidateCode, candidate.FirstName, candidate.LastName, candidate.Email, candidate.Phone,
                candidate.VacancyId, vacancy.Title, candidate.CurrentStage, candidate.Status, candidate.RegistrationChannel,
                candidate.ReferralEmployeeName, candidate.TotalExperienceYears, candidate.CurrentCTC, candidate.ExpectedCTC,
                candidate.NoticePeriodDays, candidate.CurrentLocation, candidate.HighestQualification, candidate.CreatedAt,
                pipelineProgressList, []);
        }
    }
}
