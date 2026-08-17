using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Candidate;
using STEP.Domain.Entities.Master;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;

namespace STEP.Application.Features.V2.Exams.Commands.GenerateTempExamPass
{
    public class GenerateTempExamPassCommandHandler(
        IApplicationDbContext db,
        IPasswordHasher hasher,
        IConfiguration configuration)
        : IRequestHandler<GenerateTempExamPassCommand, TempExamPassDto>
    {
        public async Task<TempExamPassDto> Handle(GenerateTempExamPassCommand request, CancellationToken cancellationToken)
        {
            VacancyEntity? vacancy = null;
            if (request.VacancyId.HasValue)
            {
                vacancy = await db.Vacancies
                    .Include(v => v.PipelineFlows)
                        .ThenInclude(f => f.Rounds)
                    .FirstOrDefaultAsync(v => v.Id == request.VacancyId.Value, cancellationToken);
            }

            if (vacancy == null && request.MasterRoleId.HasValue)
            {
                vacancy = await db.Vacancies
                    .Include(v => v.PipelineFlows)
                        .ThenInclude(f => f.Rounds)
                    .FirstOrDefaultAsync(v => v.MasterRoleId == request.MasterRoleId.Value && v.Status == "Active", cancellationToken);
            }

            vacancy ??= await db.Vacancies
                .Include(v => v.PipelineFlows)
                    .ThenInclude(f => f.Rounds)
                .OrderByDescending(v => v.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (vacancy == null)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.VacancyId),
                    "No active vacancy or drive available to bind this temporary exam pass.")]);
            }

            var nextCandidateSeq = await db.Candidates.IgnoreQueryFilters().CountAsync(cancellationToken) + 1001;
            var candidateCode = $"CAN-{DateTime.UtcNow:yyyy}-{nextCandidateSeq}";
            var rawPasscode = RandomNumberGenerator.GetInt32(1000, 9999).ToString();
            var passcodeHash = hasher.Hash(rawPasscode);

            var names = request.CandidateName.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
            var firstName = names.Length > 0 ? names[0] : "Candidate";
            var lastName = names.Length > 1 ? names[1] : $"{nextCandidateSeq}";

            var candidate = new CandidateEntity
            {
                VacancyId = vacancy.Id,
                CandidateCode = candidateCode,
                FirstName = firstName,
                LastName = lastName,
                Email = string.IsNullOrWhiteSpace(request.Email) ? $"spot.{nextCandidateSeq}@sci-pl.com" : request.Email.Trim(),
                Phone = string.IsNullOrWhiteSpace(request.Phone) ? "+91 9876543210" : request.Phone.Trim(),
                CurrentStage = "Assessment",
                Status = "In-Progress",
                ExamPasscodeHash = passcodeHash,
            };

            var defaultFlow = vacancy.PipelineFlows.FirstOrDefault(f => f.IsDefault) ?? vacancy.PipelineFlows.FirstOrDefault();
            if (defaultFlow != null)
            {
                var assessmentRound = defaultFlow.Rounds.FirstOrDefault(r => r.RoundType == "Assessment") ?? defaultFlow.Rounds.FirstOrDefault();
                if (assessmentRound != null)
                {
                    var progress = new CandidatePipelineProgress
                    {
                        Candidate = candidate,
                        VacancyPipelineFlowRoundId = assessmentRound.Id,
                        RoundNumber = assessmentRound.RoundOrder,
                        RoundTitle = assessmentRound.Name,
                        RoundType = assessmentRound.RoundType,
                        Status = "InProgress",
                    };
                    candidate.PipelineProgressHistory.Add(progress);
                }
            }

            db.Candidates.Add(candidate);
            await db.SaveChangesAsync(cancellationToken);

            var frontendUrlRaw = configuration["FRONTEND_URL"] ?? "http://localhost:3000";
            var frontendUrl = frontendUrlRaw.TrimEnd('/');
            var examUrl = $"{frontendUrl}/exam/v2?code={candidateCode}&pass={rawPasscode}";
            var validity = request.ValidityHours > 0 ? request.ValidityHours : 24;

            return new TempExamPassDto(
                candidateCode,
                rawPasscode,
                $"{firstName} {lastName}",
                vacancy.Title,
                examUrl,
                DateTime.UtcNow.AddHours(validity),
                validity
            );
        }
    }
}
