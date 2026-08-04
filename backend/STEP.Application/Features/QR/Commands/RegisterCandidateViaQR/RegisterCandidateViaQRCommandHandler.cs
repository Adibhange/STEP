using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;
using STEP.Application.Features.QR.Common;
using STEP.Domain.Entities.Audit;
using STEP.Domain.Entities.QR;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.QR.Commands.RegisterCandidateViaQR
{
    public class RegisterCandidateViaQRCommandHandler(IApplicationDbContext db) : IRequestHandler<RegisterCandidateViaQRCommand, CandidateDto>
    {
        public async Task<CandidateDto> Handle(RegisterCandidateViaQRCommand request, CancellationToken cancellationToken)
        {
            var qrCode = await db.QRCodes
                .Include(q => q.Vacancy)
                .FirstOrDefaultAsync(q => q.Code == request.Code, cancellationToken)
                ?? throw new NotFoundException(nameof(QRCode), request.Code);

            var registrationCount = await db.Candidates.CountAsync(c => c.QRCodeId == qrCode.Id, cancellationToken);
            var (isOpen, message) = QRCodeAvailability.Check(qrCode, registrationCount);
            if (!isOpen)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("Code", message ?? "This drive is not open for registration.")]);
            }

            var nextSequence = await db.Candidates.IgnoreQueryFilters().CountAsync(cancellationToken) + 1001;
            var candidateCode = $"CND-{DateTime.UtcNow:yyyy}-{nextSequence}";

            var candidate = new CandidateEntity
            {
                CandidateCode = candidateCode,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = request.Email.Trim(),
                Phone = request.Phone.Trim(),
                VacancyId = qrCode.VacancyId,
                CurrentStage = "Registered",
                Status = "Applied",
                RegistrationChannel = "Walk-in",
                QRCodeId = qrCode.Id,
                TotalExperienceYears = request.TotalExperienceYears,
                CurrentCTC = request.CurrentCTC,
                ExpectedCTC = request.ExpectedCTC,
                NoticePeriodDays = request.NoticePeriodDays,
                CurrentLocation = request.CurrentLocation,
                HighestQualification = request.HighestQualification,
            };

            db.Candidates.Add(candidate);

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
                EntityId = candidateCode,
            });

            await db.SaveChangesAsync(cancellationToken);

            return new CandidateDto(
                candidate.Id, candidate.CandidateCode, candidate.FirstName, candidate.LastName, candidate.Email, candidate.Phone,
                candidate.VacancyId, qrCode.Vacancy.Title, candidate.CurrentStage, candidate.Status, candidate.RegistrationChannel,
                candidate.ReferralEmployeeName, candidate.TotalExperienceYears, candidate.CurrentCTC, candidate.ExpectedCTC,
                candidate.NoticePeriodDays, candidate.CurrentLocation, candidate.HighestQualification, candidate.CreatedAt,
                [], []);
        }
    }
}
