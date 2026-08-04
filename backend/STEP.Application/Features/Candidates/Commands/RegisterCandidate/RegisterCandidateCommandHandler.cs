using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;
using STEP.Domain.Entities.Audit;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.Candidates.Commands.RegisterCandidate
{
    public class RegisterCandidateCommandHandler(IApplicationDbContext db) : IRequestHandler<RegisterCandidateCommand, CandidateDto>
    {
        public async Task<CandidateDto> Handle(RegisterCandidateCommand request, CancellationToken cancellationToken)
        {
            var vacancy = await db.Vacancies.FirstOrDefaultAsync(v => v.Id == request.VacancyId, cancellationToken)
                ?? throw new NotFoundException(nameof(VacancyEntity), request.VacancyId);

            var nextSequence = await db.Candidates.IgnoreQueryFilters().CountAsync(cancellationToken) + 1001;
            var candidateCode = $"CND-{DateTime.UtcNow:yyyy}-{nextSequence}";

            var candidate = new CandidateEntity
            {
                CandidateCode = candidateCode,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = request.Email.Trim(),
                Phone = request.Phone.Trim(),
                VacancyId = request.VacancyId,
                CurrentStage = "Registered",
                Status = "Applied",
                RegistrationChannel = request.RegistrationChannel,
                ReferralEmployeeName = request.ReferralEmployeeName,
                TotalExperienceYears = request.TotalExperienceYears,
                CurrentCTC = request.CurrentCTC,
                ExpectedCTC = request.ExpectedCTC,
                NoticePeriodDays = request.NoticePeriodDays,
                CurrentLocation = request.CurrentLocation,
                HighestQualification = request.HighestQualification,
            };

            db.Candidates.Add(candidate);

            db.AuditLogs.Add(new AuditLog
            {
                CorrelationId = Guid.NewGuid(),
                Action = "RegisterCandidate",
                EntityName = nameof(CandidateEntity),
                EntityId = candidateCode,
            });

            await db.SaveChangesAsync(cancellationToken);

            return new CandidateDto(
                candidate.Id, candidate.CandidateCode, candidate.FirstName, candidate.LastName, candidate.Email, candidate.Phone,
                candidate.VacancyId, vacancy.Title, candidate.CurrentStage, candidate.Status, candidate.RegistrationChannel,
                candidate.ReferralEmployeeName, candidate.TotalExperienceYears, candidate.CurrentCTC, candidate.ExpectedCTC,
                candidate.NoticePeriodDays, candidate.CurrentLocation, candidate.HighestQualification, candidate.CreatedAt,
                [], []);
        }
    }
}
