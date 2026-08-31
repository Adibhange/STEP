using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;
using STEP.Domain.Entities.Candidate;
using STEP.Domain.Entities.Master;
using STEP.Domain.Entities.QR;
using STEP.Domain.Entities.Vacancy;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.QR.Commands.RegisterUniversalCandidate
{
    public class RegisterUniversalCandidateCommandHandler(
        IApplicationDbContext db,
        IFileStorageService fileStorage,
        IPasswordHasher hasher)
        : IRequestHandler<RegisterUniversalCandidateCommand, UniversalCandidateRegistrationResultDto>
    {
        public async Task<UniversalCandidateRegistrationResultDto> Handle(RegisterUniversalCandidateCommand request, CancellationToken cancellationToken)
        {
            // ── 1. Resolve MasterRole and MasterHiringLocation ──────────────────────
            MasterRole? masterRole = null;
            if (int.TryParse(request.RoleIdentifier, out int roleId))
            {
                masterRole = await db.MasterRoles.FirstOrDefaultAsync(r => r.Id == roleId && !r.IsDeleted, cancellationToken);
            }
            if (masterRole == null && !string.IsNullOrWhiteSpace(request.RoleIdentifier))
            {
                var roleSearch = request.RoleIdentifier.Trim().ToLower();
                masterRole = await db.MasterRoles.FirstOrDefaultAsync(r =>
                    !r.IsDeleted && (r.Name.ToLower().Contains(roleSearch) || r.Code.ToLower().Contains(roleSearch) || roleSearch.Contains(r.Code.ToLower())), cancellationToken);
            }
            masterRole ??= await db.MasterRoles.FirstOrDefaultAsync(r => !r.IsDeleted, cancellationToken);

            MasterHiringLocation? location = null;
            if (int.TryParse(request.LocationIdentifier, out int locId))
            {
                location = await db.MasterHiringLocations.FirstOrDefaultAsync(l => l.Id == locId && !l.IsDeleted, cancellationToken);
            }
            if (location == null && !string.IsNullOrWhiteSpace(request.LocationIdentifier))
            {
                var locSearch = request.LocationIdentifier.Trim().ToLower();
                location = await db.MasterHiringLocations.FirstOrDefaultAsync(l =>
                    !l.IsDeleted && (l.Name.ToLower().Contains(locSearch) || l.Code.ToLower().Contains(locSearch) || locSearch.Contains(l.Code.ToLower())), cancellationToken);
            }
            location ??= await db.MasterHiringLocations.FirstOrDefaultAsync(l => !l.IsDeleted, cancellationToken);

            // ── 2. Determine Drive Type Track ("Walk-in" vs "Direct") ───────────────
            var isDirect = request.ApplicationChannel.Equals("Direct", StringComparison.OrdinalIgnoreCase) ||
                           request.ApplicationChannel.Contains("Online", StringComparison.OrdinalIgnoreCase);
            var targetDriveType = isDirect ? "Direct" : "Walk-in";

            // ── 3. Smart Vacancy Auto-Matcher ────────────────────────────────────────
            var matchingVacancy = await db.Vacancies
                .Include(v => v.PipelineFlows)
                    .ThenInclude(f => f.Rounds)
                .Include(v => v.MasterRole)
                .Include(v => v.HiringLocation)
                .Where(v => !v.IsDeleted && v.Status == "Active")
                .Where(v => (masterRole == null || v.MasterRoleId == masterRole.Id))
                .Where(v => (location == null || v.HiringLocationId == location.Id))
                .Where(v => (v.DriveType == targetDriveType || v.DriveType.Contains(targetDriveType)))
                .OrderByDescending(v => v.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            // If no exact match, fallback to matching the Role & active status
            if (matchingVacancy == null && masterRole != null)
            {
                matchingVacancy = await db.Vacancies
                    .Include(v => v.PipelineFlows)
                        .ThenInclude(f => f.Rounds)
                    .Include(v => v.MasterRole)
                    .Include(v => v.HiringLocation)
                    .Where(v => !v.IsDeleted && v.Status == "Active" && v.MasterRoleId == masterRole.Id)
                    .OrderByDescending(v => v.CreatedAt)
                    .FirstOrDefaultAsync(cancellationToken);
            }

            // If still no vacancy exists, Auto-Provision an Active Vacancy on-the-fly!
            if (matchingVacancy == null)
            {
                var roleName = masterRole?.Name ?? "Software Engineering";
                var locName = location?.Name ?? "Corporate Center";
                var codeSuffix = Random.Shared.Next(1000, 9999);
                var defaultDept = await db.MasterDepartments.FirstOrDefaultAsync(d => !d.IsDeleted, cancellationToken);
                var defaultEmpType = await db.MasterEmploymentTypes.FirstOrDefaultAsync(e => !e.IsDeleted, cancellationToken);

                matchingVacancy = new Vacancy
                {
                    VacancyCode = $"VAC-{DateTime.UtcNow:yyyyMM}-{codeSuffix}",
                    Title = $"{roleName} ({targetDriveType})",
                    MasterRoleId = masterRole?.Id ?? 1,
                    HiringLocationId = location?.Id ?? 1,
                    DepartmentId = defaultDept?.Id ?? 1,
                    EmploymentTypeId = defaultEmpType?.Id ?? 1,
                    DriveType = targetDriveType,
                    Status = "Active",
                    TotalOpenings = 5,
                    WalkinDriveDate = DateTime.UtcNow.Date,
                    CreatedAt = DateTime.UtcNow
                };

                var defaultFlow = new VacancyPipelineFlow
                {
                    VersionName = $"{roleName} Standard Pipeline",
                    IsDefault = true,
                    Rounds = new System.Collections.Generic.List<VacancyPipelineFlowRound>
                    {
                        new() { RoundOrder = 1, Name = isDirect ? "Round 1: HR Sourcing & Screening" : "Round 1: Proctored Assessment", RoundType = "Assessment" },
                        new() { RoundOrder = 2, Name = "Round 2: Technical Interview", RoundType = "Technical" },
                        new() { RoundOrder = 3, Name = "Round 3: Final Director / HR Round", RoundType = "HR" }
                    }
                };
                matchingVacancy.PipelineFlows.Add(defaultFlow);
                db.Vacancies.Add(matchingVacancy);
                await db.SaveChangesAsync(cancellationToken);
            }

            // ── 4. Ensure Campaign QRCode Link Exists ──────────────────────────────
            var qrCode = await db.QRCodes.FirstOrDefaultAsync(q => q.VacancyId == matchingVacancy.Id, cancellationToken);
            if (qrCode == null)
            {
                qrCode = new QRCode
                {
                    VacancyId = matchingVacancy.Id,
                    Code = $"QR-{matchingVacancy.VacancyCode}",
                    RegistrationUrl = $"/apply/{matchingVacancy.VacancyCode}",
                    VenueName = matchingVacancy.Title,
                    DriveDate = matchingVacancy.WalkinDriveDate ?? DateTime.UtcNow.Date,
                    Capacity = 1000,
                    RegistrationDeadline = DateTime.UtcNow.AddMonths(3),
                    Status = "Active"
                };
                db.QRCodes.Add(qrCode);
                await db.SaveChangesAsync(cancellationToken);
            }

            // ── 5. Cooldown Policy Check (90-Day Re-application Guard) ────────────
            var emailLower = request.Email.Trim().ToLower();
            var phone = request.Phone.Trim();
            var lastApplication = await db.Candidates
                .Include(c => c.Vacancy)
                .Where(c => (c.VacancyId == matchingVacancy.Id || (masterRole != null && c.Vacancy.MasterRoleId == masterRole.Id))
                         && (c.Email.ToLower() == emailLower || c.Phone == phone))
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => (DateTime?)c.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            var eligibility = CandidateReapplicationPolicy.Evaluate(lastApplication);
            if (!eligibility.CanApply)
            {
                var roleTitle = masterRole?.Name ?? matchingVacancy.Title;
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.Email),
                    $"You already applied for '{roleTitle}' on {eligibility.LastAppliedAt:dd MMM yyyy}. You can re-apply for this role after {eligibility.EligibleFrom:dd MMM yyyy} ({CandidateReapplicationPolicy.CooldownDays}-day cooldown policy).")]);
            }

            // ── 6. Create Candidate Entity ─────────────────────────────────────────
            var nextSequence = await db.Candidates.IgnoreQueryFilters().CountAsync(cancellationToken) + 1001;
            var candidateCode = $"CND-{DateTime.UtcNow:yyyy}-{nextSequence}";

            var defaultFlowResolved = matchingVacancy.PipelineFlows?.FirstOrDefault(f => f.IsDefault && !f.IsDeleted)
                ?? matchingVacancy.PipelineFlows?.FirstOrDefault(f => !f.IsDeleted);
            var round1 = defaultFlowResolved?.Rounds?.FirstOrDefault(r => r.RoundOrder == 1 && !r.IsDeleted);

            var initialStage = round1?.Name ?? (isDirect ? "Round 1: HR Sourcing & Screening" : "Round 1: Proctored Assessment");

            var candidate = new CandidateEntity
            {
                CandidateCode = candidateCode,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = emailLower,
                Phone = phone,
                VacancyId = matchingVacancy.Id,
                CurrentStage = initialStage,
                Status = "Applied",
                RegistrationChannel = isDirect ? "Direct Sourced" : "Walk-in",
                QRCodeId = qrCode.Id,
                TotalExperienceYears = request.TotalExperienceYears,
                CurrentCTC = request.CurrentCTC,
                ExpectedCTC = request.ExpectedCTC,
                NoticePeriodDays = request.NoticePeriodDays,
                CurrentLocation = request.CurrentLocation?.Trim(),
                HighestQualification = request.HighestQualification,
                ReferralEmployeeName = !string.IsNullOrWhiteSpace(request.RefName) ? $"{request.RefName.Trim()} ({request.RefType ?? "Direct"})" : null,
                CreatedAt = DateTime.UtcNow,
            };

            // If Walk-in applicant, set default proctored assessment passcode "1234"
            if (!isDirect)
            {
                candidate.ExamPasscodeHash = hasher.Hash("1234");
            }

            db.Candidates.Add(candidate);
            await db.SaveChangesAsync(cancellationToken);

            // Initialize Round 1 Candidate Pipeline Progress
            if (round1 != null)
            {
                var r1Progress = new CandidatePipelineProgress
                {
                    CandidateId = candidate.Id,
                    VacancyPipelineFlowRoundId = round1.Id,
                    RoundNumber = 1,
                    RoundTitle = round1.Name,
                    RoundType = round1.RoundType ?? "Assessment",
                    Status = isDirect ? "Pending" : "Ready",
                    StartedAt = DateTime.UtcNow,
                };
                db.CandidatePipelineProgresses.Add(r1Progress);
                candidate.CurrentPipelineProgress = r1Progress;
                await db.SaveChangesAsync(cancellationToken);
            }

            // ── 7. Save Document Uploads (Photo & Resume) ──────────────────────────
            var photoPayload = request.PhotoBase64 ?? request.AvatarUrl;
            if (!string.IsNullOrWhiteSpace(photoPayload))
            {
                var (bytes, mime) = ParseBase64(photoPayload, request.PhotoContentType ?? "image/jpeg");
                if (bytes.Length > 0)
                {
                    var ext = mime.Contains("png") ? ".png" : mime.Contains("webp") ? ".webp" : ".jpg";
                    var rawFileName = !string.IsNullOrWhiteSpace(request.PhotoFileName) ? request.PhotoFileName : $"profile_photo{ext}";

                    using var ms = new MemoryStream(bytes);
                    var storedPath = await fileStorage.SaveAsync($"candidates/{candidate.Id}", rawFileName, ms, cancellationToken);

                    var photoDoc = new CandidateDocument
                    {
                        CandidateId = candidate.Id,
                        DocumentType = "Profile Photo",
                        FileName = rawFileName,
                        FilePath = storedPath,
                        ContentType = mime,
                        FileSizeBytes = bytes.Length,
                        StorageProvider = fileStorage.ProviderName,
                        UploadedAt = DateTime.UtcNow
                    };
                    db.CandidateDocuments.Add(photoDoc);
                    candidate.Documents.Add(photoDoc);
                }
            }

            if (!string.IsNullOrWhiteSpace(request.ResumeBase64))
            {
                var (bytes, mime) = ParseBase64(request.ResumeBase64, request.ResumeContentType ?? "application/pdf");
                if (bytes.Length > 0)
                {
                    var ext = mime.Contains("word") || mime.Contains("docx") ? ".docx" : mime.Contains("doc") ? ".doc" : ".pdf";
                    var rawFileName = !string.IsNullOrWhiteSpace(request.ResumeFileName) ? request.ResumeFileName : $"resume{ext}";

                    using var ms = new MemoryStream(bytes);
                    var storedPath = await fileStorage.SaveAsync($"candidates/{candidate.Id}", rawFileName, ms, cancellationToken);

                    var resumeDoc = new CandidateDocument
                    {
                        CandidateId = candidate.Id,
                        DocumentType = "Resume",
                        FileName = rawFileName,
                        FilePath = storedPath,
                        ContentType = mime,
                        FileSizeBytes = bytes.Length,
                        StorageProvider = fileStorage.ProviderName,
                        UploadedAt = DateTime.UtcNow
                    };
                    db.CandidateDocuments.Add(resumeDoc);
                    candidate.Documents.Add(resumeDoc);
                }
            }

            await db.SaveChangesAsync(cancellationToken);

            // ── 8. Return Result DTO ───────────────────────────────────────────────
            var docDtos = candidate.Documents
                .Select(d => new CandidateDocumentDto(d.Id, d.DocumentType, d.FileName, d.ContentType, d.FileSizeBytes, d.StorageProvider, d.UploadedAt))
                .ToList();

            var candidateDto = new CandidateDto(
                candidate.Id,
                candidate.CandidateCode,
                candidate.FirstName,
                candidate.LastName,
                candidate.Email,
                candidate.Phone,
                matchingVacancy.Id,
                matchingVacancy.Title,
                candidate.CurrentStage,
                candidate.Status,
                candidate.RegistrationChannel,
                candidate.ReferralEmployeeName,
                candidate.TotalExperienceYears,
                candidate.CurrentCTC,
                candidate.ExpectedCTC,
                candidate.NoticePeriodDays,
                candidate.CurrentLocation,
                candidate.HighestQualification,
                candidate.CreatedAt,
                [],
                docDtos
            );

            return new UniversalCandidateRegistrationResultDto(
                candidateDto,
                candidate.CandidateCode,
                $"{candidate.FirstName} {candidate.LastName}",
                masterRole?.Name ?? matchingVacancy.Title,
                location?.Name ?? "Corporate Center",
                targetDriveType,
                candidate.CurrentStage,
                isDirect ? null : "1234",
                isDirect ? null : $"/exam?code={candidate.CandidateCode}&pass=1234"
            );
        }

        private static (byte[] Bytes, string ContentType) ParseBase64(string dataUrlOrBase64, string fallbackContentType)
        {
            if (string.IsNullOrWhiteSpace(dataUrlOrBase64)) return (Array.Empty<byte>(), fallbackContentType);

            var contentType = fallbackContentType;
            var raw = dataUrlOrBase64.Trim();

            if (raw.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            {
                var commaIdx = raw.IndexOf(',');
                if (commaIdx > 0)
                {
                    var header = raw[5..commaIdx];
                    var semiIdx = header.IndexOf(';');
                    if (semiIdx > 0)
                    {
                        contentType = header[..semiIdx];
                    }
                    else
                    {
                        contentType = header;
                    }
                    raw = raw[(commaIdx + 1)..];
                }
            }

            try
            {
                return (Convert.FromBase64String(raw), contentType);
            }
            catch
            {
                return (Array.Empty<byte>(), contentType);
            }
        }
    }
}
