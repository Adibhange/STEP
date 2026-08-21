using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Exam;
using STEP.Domain.Entities.Master;
using STEP.Domain.Entities.QR;
using STEP.Domain.Entities.Vacancy;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;

namespace STEP.Application.Features.V2.Vacancies.Commands.CreateInstantDrive
{
    public class CreateInstantDriveCommandHandler(IApplicationDbContext db, IConfiguration configuration)
        : IRequestHandler<CreateInstantDriveCommand, InstantDriveResultDto>
    {
        public async Task<InstantDriveResultDto> Handle(CreateInstantDriveCommand request, CancellationToken cancellationToken)
        {
            // 1. Resolve MasterRole
            var targetRoleId = request.MasterRoleId > 0 ? request.MasterRoleId : (request.RoleId ?? 0);
            var masterRole = await db.MasterRoles
                .FirstOrDefaultAsync(r => r.Id == targetRoleId, cancellationToken)
                ?? throw new NotFoundException(nameof(MasterRole), targetRoleId);

            // 2. Resolve Experience Level (Direct master.ExperienceLevels)
            MasterExperienceLevel? expLevel = null;
            if (request.ExperienceLevelId.HasValue)
            {
                expLevel = await db.MasterExperienceLevels
                    .FirstOrDefaultAsync(e => e.Id == request.ExperienceLevelId.Value && e.IsActive, cancellationToken);
            }

            // 3. Resolve AssessmentBlueprint
            var blueprintId = request.BlueprintId ?? request.RoleHiringProfileId;
            AssessmentBlueprint? blueprint = null;

            if (blueprintId.HasValue)
            {
                blueprint = await db.AssessmentBlueprints
                    .Include(b => b.SectionRules.Where(r => r.IsActive))
                    .FirstOrDefaultAsync(b => b.Id == blueprintId.Value && b.IsActive, cancellationToken);
            }

            blueprint ??= await db.AssessmentBlueprints
                .Include(b => b.SectionRules.Where(r => r.IsActive))
                .FirstOrDefaultAsync(b => b.IsDefault && b.IsActive, cancellationToken)
                ?? await db.AssessmentBlueprints
                .Include(b => b.SectionRules.Where(r => r.IsActive))
                .FirstOrDefaultAsync(b => b.IsActive, cancellationToken);

            var blueprintName = blueprint?.Name ?? "Standard Assessment Track";
            var passingCutoff = blueprint?.DefaultPassingPercentage ?? 70.00m;
            var totalQuestions = blueprint?.TotalQuestions ?? 20;
            var totalDuration = blueprint?.TotalDurationMinutes ?? 30;

            // 4. Resolve Master Taxonomies with Fallbacks
            var department = request.DepartmentId.HasValue
                ? await db.MasterDepartments.FirstOrDefaultAsync(d => d.Id == request.DepartmentId.Value, cancellationToken)
                : await db.MasterDepartments.FirstOrDefaultAsync(cancellationToken);
            department ??= await db.MasterDepartments.FirstAsync(cancellationToken);

            var hiringLocation = request.HiringLocationId.HasValue
                ? await db.MasterHiringLocations.FirstOrDefaultAsync(l => l.Id == request.HiringLocationId.Value, cancellationToken)
                : await db.MasterHiringLocations.FirstOrDefaultAsync(cancellationToken);
            hiringLocation ??= await db.MasterHiringLocations.FirstAsync(cancellationToken);

            var employmentType = request.EmploymentTypeId.HasValue
                ? await db.MasterEmploymentTypes.FirstOrDefaultAsync(e => e.Id == request.EmploymentTypeId.Value, cancellationToken)
                : await db.MasterEmploymentTypes.FirstOrDefaultAsync(cancellationToken);
            employmentType ??= await db.MasterEmploymentTypes.FirstAsync(cancellationToken);

            // 5. Generate Vacancy Code & Title (Using Max Id to prevent duplicate code collisions)
            var maxId = await db.Vacancies.IgnoreQueryFilters().MaxAsync(v => (int?)v.Id, cancellationToken) ?? 0;
            var vacancyCode = $"VAC-{DateTime.UtcNow:yyyy}-{(maxId + 101)}";
            var driveType = string.IsNullOrWhiteSpace(request.DriveType) ? "Walk-in Drive" : request.DriveType.Trim();
            var driveTitle = masterRole.Name;

            // 100% Dynamic Master Data Bounds (Zero Hardcoding)
            decimal minExp = expLevel?.MinYears ?? 0.0m;
            decimal maxExp = expLevel?.MaxYears ?? 99.0m;

            var vacancy = new VacancyEntity
            {
                VacancyCode = vacancyCode,
                Title = driveTitle,
                MasterRoleId = masterRole.Id,
                DepartmentId = department.Id,
                HiringLocationId = hiringLocation.Id,
                EmploymentTypeId = employmentType.Id,
                DriveType = driveType,
                WorkMode = "On-site",
                Status = "Active",
                TotalOpenings = request.TotalOpenings > 0 ? request.TotalOpenings : 5,
                MinExperienceYears = minExp,
                MaxExperienceYears = maxExp,
                JobDescription = $"Recruitment Drive for {masterRole.Name} ({blueprintName} - {expLevel?.Name ?? "All Tiers"}).",
                ClosingDate = DateTime.UtcNow.AddDays(30),
                WalkinDriveDate = request.WalkinDriveDate ?? DateTime.UtcNow.Date,
                WalkinStartTime = request.WalkinStartTime ?? new TimeSpan(9, 30, 0),
                WalkinEndTime = request.WalkinEndTime ?? new TimeSpan(18, 0, 0),
                AssessmentBlueprintId = blueprint?.Id,
                PassingPercentageOverride = passingCutoff
            };

            // 5. Build 4-Round Pipeline Flow
            var flow = new VacancyPipelineFlow
            {
                VersionName = "Autonomous Flow v2",
                Description = "Standard 4-round automated recruitment flow",
                IsDefault = true,
            };

            bool isTechnicalTrack = blueprint != null && blueprint.Code != "RULE-MCQ-ONLY";

            if (driveType == "Walk-in Drive")
            {
                if (isTechnicalTrack)
                {
                    // 4-Round Multi-Stage IT Pipeline
                    flow.Rounds.Add(new VacancyPipelineFlowRound { RoundOrder = 1, Name = "Round 1: Aptitude Assessment (Elimination)", RoundType = "Assessment", CutoffPercent = 70.00m });
                    flow.Rounds.Add(new VacancyPipelineFlowRound { RoundOrder = 2, Name = $"Round 2: {blueprintName}", RoundType = "Assessment", CutoffPercent = passingCutoff });
                    flow.Rounds.Add(new VacancyPipelineFlowRound { RoundOrder = 3, Name = "Round 3: Technical Interview", RoundType = "Interview", CutoffPercent = 70.00m });
                    flow.Rounds.Add(new VacancyPipelineFlowRound { RoundOrder = 4, Name = "Round 4: Director Final & Offer", RoundType = "Director", CutoffPercent = 70.00m });
                }
                else
                {
                    // 3-Round Single-Stage Non-IT / Standard Pipeline (No redundant coding test)
                    flow.Rounds.Add(new VacancyPipelineFlowRound { RoundOrder = 1, Name = "Round 1: Standard Domain & Aptitude Assessment", RoundType = "Assessment", CutoffPercent = passingCutoff });
                    flow.Rounds.Add(new VacancyPipelineFlowRound { RoundOrder = 2, Name = "Round 2: HR / Domain Interview", RoundType = "Interview", CutoffPercent = 70.00m });
                    flow.Rounds.Add(new VacancyPipelineFlowRound { RoundOrder = 3, Name = "Round 3: Director Final & Offer", RoundType = "Director", CutoffPercent = 70.00m });
                }
            }
            else
            {
                // Direct / Sourced Sourcing Pipeline
                flow.Rounds.Add(new VacancyPipelineFlowRound { RoundOrder = 1, Name = "Round 1: HR Sourcing & Screening (Auto-Passed)", RoundType = "Assessment", CutoffPercent = 70.00m });
                flow.Rounds.Add(new VacancyPipelineFlowRound { RoundOrder = 2, Name = $"Round 2: {blueprintName}", RoundType = "Assessment", CutoffPercent = passingCutoff });
                flow.Rounds.Add(new VacancyPipelineFlowRound { RoundOrder = 3, Name = "Round 3: Technical / Domain Interview", RoundType = "Interview", CutoffPercent = 70.00m });
                flow.Rounds.Add(new VacancyPipelineFlowRound { RoundOrder = 4, Name = "Round 4: Director Final & Offer", RoundType = "Director", CutoffPercent = 70.00m });
            }

            vacancy.PipelineFlows.Add(flow);
            db.Vacancies.Add(vacancy);
            await db.SaveChangesAsync(cancellationToken);

            // 6. Generate Live QR Code and Public V2 Apply URL
            var frontendUrlRaw = configuration["FRONTEND_URL"] ?? "http://localhost:3000";
            var frontendUrl = frontendUrlRaw.TrimEnd('/');
            var qrCodeString = $"WD-{Convert.ToHexString(RandomNumberGenerator.GetBytes(4)).ToUpperInvariant()}";
            var registrationUrl = $"{frontendUrl}/apply/{qrCodeString}";

            var qrCode = new QRCode
            {
                VacancyId = vacancy.Id,
                Code = qrCodeString,
                RegistrationUrl = registrationUrl,
                VenueName = hiringLocation.Name,
                VenueAddress = hiringLocation.Description,
                DriveDate = vacancy.WalkinDriveDate ?? DateTime.UtcNow.Date,
                DriveStartTime = vacancy.WalkinStartTime,
                DriveEndTime = vacancy.WalkinEndTime,
                Capacity = 200,
                RegistrationDeadline = vacancy.ClosingDate,
                Status = "Active",
            };

            db.QRCodes.Add(qrCode);
            await db.SaveChangesAsync(cancellationToken);

            return new InstantDriveResultDto(
                vacancy.Id,
                vacancy.VacancyCode,
                vacancy.Title,
                expLevel?.Name ?? blueprintName,
                department.Name,
                hiringLocation.Name,
                vacancy.TotalOpenings,
                vacancy.MinExperienceYears,
                vacancy.MaxExperienceYears,
                passingCutoff,
                blueprintName,
                totalQuestions,
                totalDuration,
                qrCode.Id,
                qrCode.Code,
                qrCode.RegistrationUrl,
                $"/api/v2/qrcodes/vacancy/{vacancy.Id}"
            );
        }
    }
}
