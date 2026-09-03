using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
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
    public class RegisterCandidateCommandHandler(IApplicationDbContext db, ICandidateAdvancementService advancementService) : IRequestHandler<RegisterCandidateCommand, CandidateDto>
    {
        public async Task<CandidateDto> Handle(RegisterCandidateCommand request, CancellationToken cancellationToken)
        {
            var vacancy = await db.Vacancies
                .Include(v => v.PipelineFlows).ThenInclude(f => f.Rounds)
                .FirstOrDefaultAsync(v => v.Id == request.VacancyId, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyEntity), request.VacancyId);

            var isDirectHiring = vacancy.DriveType == "Direct" || vacancy.DriveType == "Direct / Sourced Hiring" || vacancy.DriveType == "Direct Hiring";
            var channel = !string.IsNullOrWhiteSpace(request.RegistrationChannel) ? request.RegistrationChannel : (isDirectHiring ? "Direct Sourced" : "Walk-in");
            var defaultFlow = vacancy.PipelineFlows?.FirstOrDefault(f => f.IsDefault && !f.IsDeleted)
                ?? vacancy.PipelineFlows?.FirstOrDefault(f => !f.IsDeleted);
            var round1 = defaultFlow?.Rounds?.FirstOrDefault(r => r.RoundOrder == 1 && !r.IsDeleted);

            var candidate = new CandidateEntity
            {
                CandidateCode = $"TMP-{Guid.NewGuid().ToString("N")[..16]}",
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Phone = request.Phone.Trim(),
                VacancyId = request.VacancyId,
                CurrentStage = round1 != null ? round1.Name : (isDirectHiring ? "Round 1: HR Sourcing & Screening (Auto-Passed)" : "Registered"),
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

            var pipelineProgressList = new List<PipelineProgressDto>();

            if (round1 != null)
            {
                var isAutoPassed = round1.Name.Contains("Auto-Passed", StringComparison.OrdinalIgnoreCase) || isDirectHiring;
                var hrUser = await db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Role.Name == "HR" && u.IsActive, cancellationToken);

                var r1Progress = new CandidatePipelineProgress
                {
                    CandidateId = candidate.Id,
                    VacancyPipelineFlowRoundId = round1.Id,
                    RoundNumber = 1,
                    RoundTitle = round1.Name,
                    RoundType = "Assessment",
                    Status = isAutoPassed ? "Passed" : "Pending",
                    ScoreObtained = isAutoPassed ? 100.00m : null,
                    StartedAt = isAutoPassed ? DateTime.UtcNow : null,
                    CompletedAt = isAutoPassed ? DateTime.UtcNow : null,
                    EvaluatorId = hrUser?.Id ?? vacancy.CreatedBy,
                    TestPasscode = "1234",
                    Remarks = isAutoPassed ? "HR Sourced & Pre-Qualified Direct Applicant" : "Round 1 Aptitude Assessment scheduled",
                };

                db.CandidatePipelineProgresses.Add(r1Progress);
                candidate.PipelineProgressHistory.Add(r1Progress);
                candidate.CurrentPipelineProgress = r1Progress;
                candidate.CurrentStage = round1.Name;
                await db.SaveChangesAsync(cancellationToken); // Save to generate r1Progress.Id

                if (isAutoPassed)
                {
                    var advResult = await advancementService.AdvanceOrResolveAsync(candidate, r1Progress, true, cancellationToken);
                    if (candidate.CurrentPipelineProgress != null)
                    {
                        var r2 = candidate.CurrentPipelineProgress;
                        pipelineProgressList.Add(new PipelineProgressDto(
                            r2.Id, r2.RoundNumber, r2.RoundTitle, r2.RoundType,
                            r2.Status, r2.ScoreObtained, r2.StartedAt, r2.CompletedAt,
                            null, null, r2.Remarks, null, null));
                    }
                }

                pipelineProgressList.Add(new PipelineProgressDto(
                    r1Progress.Id, r1Progress.RoundNumber, r1Progress.RoundTitle, r1Progress.RoundType,
                    r1Progress.Status, r1Progress.ScoreObtained, r1Progress.StartedAt, r1Progress.CompletedAt,
                    null, null, r1Progress.Remarks, hrUser != null ? $"{hrUser.FirstName} {hrUser.LastName}".Trim() : null, hrUser?.Id));
            }

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
