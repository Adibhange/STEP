using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Services;
using STEP.Application.Features.Candidates.Common;
using STEP.Application.Features.QR.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.Candidate;
using STEP.Domain.Entities.QR;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.QR.Commands.RegisterCandidateViaQR
{
    public class RegisterCandidateViaQRCommandHandler(IApplicationDbContext db, IFileStorageService fileStorage, IPipelineInitializationService pipelineService)
        : IRequestHandler<RegisterCandidateViaQRCommand, CandidateDto>
    {
        public async Task<CandidateDto> Handle(RegisterCandidateViaQRCommand request, CancellationToken cancellationToken)
        {
            var qrCode = await db.QRCodes
                .Include(q => q.Vacancy)
                    .ThenInclude(v => v.PipelineFlows)
                        .ThenInclude(f => f.Rounds)
                .AsSplitQuery()
                .FirstOrDefaultAsync(q => q.Code == request.Code, cancellationToken);

            if (qrCode == null)
            {
                var vacancy = await db.Vacancies
                    .Include(v => v.PipelineFlows)
                        .ThenInclude(f => f.Rounds)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync(v => v.VacancyCode == request.Code, cancellationToken);

                if (vacancy == null && int.TryParse(request.Code, out int numericId))
                {
                    vacancy = await db.Vacancies
                        .Include(v => v.PipelineFlows)
                            .ThenInclude(f => f.Rounds)
                        .AsSplitQuery()
                        .FirstOrDefaultAsync(v => v.Id == numericId, cancellationToken);
                }

                if (vacancy != null)
                {
                    qrCode = await db.QRCodes
                        .Include(q => q.Vacancy)
                        .FirstOrDefaultAsync(q => q.VacancyId == vacancy.Id, cancellationToken);

                    if (qrCode == null)
                    {
                        qrCode = new QRCode
                        {
                            VacancyId = vacancy.Id,
                            Code = $"QR-{vacancy.VacancyCode}",
                            RegistrationUrl = $"/apply/{vacancy.VacancyCode}",
                            VenueName = vacancy.Title,
                            DriveDate = vacancy.WalkinDriveDate ?? DateTime.UtcNow.Date,
                            Capacity = 500,
                            RegistrationDeadline = DateTime.UtcNow.AddMonths(1),
                            Status = "Active"
                        };
                        db.QRCodes.Add(qrCode);
                        await db.SaveChangesAsync(cancellationToken);
                        qrCode.Vacancy = vacancy;
                    }
                }
            }

            if (qrCode == null)
            {
                throw new NotFoundException(nameof(QRCode), request.Code);
            }

            var registrationCount = await db.Candidates.CountAsync(c => c.QRCodeId == qrCode.Id, cancellationToken);
            var (isOpen, message) = QRCodeAvailability.Check(qrCode, registrationCount);
            if (!isOpen)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("Code", message ?? "This drive is not open for registration.")]);
            }

            var emailLower = request.Email.Trim().ToLower();
            var phone = request.Phone.Trim();
            var lastApplication = await db.Candidates
                .Where(c => c.VacancyId == qrCode.VacancyId && (c.Email.ToLower() == emailLower || c.Phone == phone))
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => (DateTime?)c.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            var eligibility = CandidateReapplicationPolicy.Evaluate(lastApplication);
            if (!eligibility.CanApply)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.Email),
                    $"You already applied for this role on {eligibility.LastAppliedAt:dd MMM yyyy}. You can re-apply for the same role after {eligibility.EligibleFrom:dd MMM yyyy} ({CandidateReapplicationPolicy.CooldownDays}-day cooldown).")]);
            }

            var isDirectHiring = qrCode.Vacancy?.DriveType == "Direct" || qrCode.Vacancy?.DriveType == "Direct / Sourced Hiring" || qrCode.Vacancy?.DriveType == "Direct Hiring";
            var channel = isDirectHiring ? "Direct Sourced" : "Walk-in";

            var candidate = new CandidateEntity
            {
                CandidateCode = $"TMP-{Guid.NewGuid().ToString("N")[..16]}",
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = request.Email.Trim(),
                Phone = request.Phone.Trim(),
                VacancyId = qrCode.VacancyId,
                CurrentStage = "Registered",
                Status = "Applied",
                RegistrationChannel = channel,
                QRCodeId = qrCode.Id,
                TotalExperienceYears = request.TotalExperienceYears,
                CurrentCTC = request.CurrentCTC,
                ExpectedCTC = request.ExpectedCTC,
                NoticePeriodDays = request.NoticePeriodDays,
                CurrentLocation = request.CurrentLocation,
                HighestQualification = request.HighestQualification,
                Gender = request.Gender,
                Dob = request.Dob,
                CurrentCompany = request.CurrentCompany,
                CurrentDesignation = request.CurrentDesignation,
                InstitutionName = request.InstitutionName,
                YearOfPassing = request.YearOfPassing,
                MarksPercentage = request.MarksPercentage,
                ReferralEmployeeName = !string.IsNullOrWhiteSpace(request.RefName) ? $"{request.RefName} ({request.RefType ?? "Direct"})" : null,
            };

            db.Candidates.Add(candidate);
            await db.SaveChangesAsync(cancellationToken);

            // Assign clean sequential candidate code based on auto-incrementing DB Id (e.g. CND-2026-0001)
            candidate.CandidateCode = $"CND-{DateTime.UtcNow:yyyy}-{candidate.Id:D4}";

            // Initialize Pipeline using shared service
            var pipelineProgressDtos = await pipelineService.InitializeCandidatePipelineAsync(
                candidate, 
                qrCode.Vacancy ?? await db.Vacancies.FindAsync(qrCode.VacancyId), 
                isDirectHiring, 
                cancellationToken);

            // Save Candidate Profile Photo / Avatar if provided
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

            // Save Candidate Resume Document if provided
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

            db.QRScanAnalytics.Add(new QRScanAnalytic
            {
                QRCodeId = qrCode.Id,
                ResultedInRegistration = true,
            });

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                Action = "RegisterCandidateViaQR",
                EntityName = nameof(CandidateEntity),
                EntityId = candidate.CandidateCode,
            });

            await db.SaveChangesAsync(cancellationToken);

            var docDtos = candidate.Documents
                .Select(d => new CandidateDocumentDto(d.Id, d.DocumentType, d.FileName, d.ContentType, d.FileSizeBytes, d.StorageProvider, d.UploadedAt))
                .ToList();

            return new CandidateDto(
                candidate.Id, candidate.CandidateCode, candidate.FirstName, candidate.LastName, candidate.Email, candidate.Phone,
                candidate.VacancyId, qrCode.Vacancy?.Title ?? "Position", candidate.CurrentStage, candidate.Status, candidate.RegistrationChannel,
                candidate.ReferralEmployeeName, candidate.TotalExperienceYears, candidate.CurrentCTC, candidate.ExpectedCTC,
                candidate.NoticePeriodDays, candidate.CurrentLocation, candidate.HighestQualification, candidate.CreatedAt,
                pipelineProgressDtos, docDtos);
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
