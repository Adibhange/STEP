using System;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.Candidates.Commands.ScheduleCandidateTest
{
    public record ScheduleCandidateTestCommand(
        int CandidateId,
        string TestMode,          // "From Home" or "In Office"
        string ScheduledDate,     // "YYYY-MM-DD" e.g. "2026-08-10"
        string StartTime,         // "09:00" or "10:00"
        string EndTime,           // "12:00" or "17:00"
        string? Passcode          // 4-digit PIN for remote tests
    ) : IRequest<CandidateDto>;

    public class ScheduleCandidateTestCommandHandler(IApplicationDbContext db, IPasswordHasher hasher)
        : IRequestHandler<ScheduleCandidateTestCommand, CandidateDto>
    {
        public async Task<CandidateDto> Handle(ScheduleCandidateTestCommand request, CancellationToken cancellationToken)
        {
            var candidate = await db.Candidates
                .Include(c => c.Vacancy)
                .Include(c => c.PipelineProgressHistory)
                .FirstOrDefaultAsync(c => c.Id == request.CandidateId, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateEntity), request.CandidateId);

            var round = candidate.PipelineProgressHistory
                .FirstOrDefault(p => p.RoundType == "Assessment")
                ?? candidate.PipelineProgressHistory.FirstOrDefault(p => p.RoundNumber == 2)
                ?? candidate.PipelineProgressHistory.FirstOrDefault();

            if (round == null)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure(nameof(request.CandidateId), "No assessment round found to schedule.")]);
            }

            // Parse date & time slot
            DateTime dateParsed;
            if (!DateTime.TryParseExact(request.ScheduledDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out dateParsed))
            {
                dateParsed = DateTime.Today;
            }

            TimeSpan startTimeSpan = TimeSpan.FromHours(10);
            TimeSpan endTimeSpan = TimeSpan.FromHours(12);

            if (TimeSpan.TryParse(request.StartTime, out var sTime)) startTimeSpan = sTime;
            if (TimeSpan.TryParse(request.EndTime, out var eTime)) endTimeSpan = eTime;

            var startUtc = DateTime.SpecifyKind(dateParsed.Add(startTimeSpan), DateTimeKind.Local).ToUniversalTime();
            var endUtc = DateTime.SpecifyKind(dateParsed.Add(endTimeSpan), DateTimeKind.Local).ToUniversalTime();

            // Update candidate passcode if provided
            if (!string.IsNullOrWhiteSpace(request.Passcode))
            {
                candidate.ExamPasscodeHash = hasher.Hash(request.Passcode);
            }

            // Update round slot properties and RESET status to InProgress so candidate can attempt/re-attempt
            round.ScheduledTestDate = dateParsed;
            round.ScheduledStartTimeUtc = startUtc;
            round.ScheduledEndTimeUtc = endUtc;
            round.AssessmentMode = request.TestMode;
            round.TestPasscode = request.Passcode;
            round.Status = "InProgress";
            round.StartedAt = null;
            round.CompletedAt = null;
            round.EvaluatedAt = null;

            await db.SaveChangesAsync(cancellationToken);

            var historyDtos = candidate.PipelineProgressHistory
                .OrderBy(p => p.RoundNumber)
                .Select(p => new PipelineProgressDto(
                    p.Id, p.RoundNumber, p.RoundTitle, p.RoundType, p.Status,
                    p.ScoreObtained, p.StartedAt, p.CompletedAt, null, null))
                .ToList();

            return new CandidateDto(
                candidate.Id, candidate.CandidateCode, candidate.FirstName, candidate.LastName, candidate.Email, candidate.Phone,
                candidate.VacancyId, candidate.Vacancy?.Title ?? "N/A", candidate.CurrentStage, candidate.Status, candidate.RegistrationChannel,
                candidate.ReferralEmployeeName, candidate.TotalExperienceYears, candidate.CurrentCTC, candidate.ExpectedCTC,
                candidate.NoticePeriodDays, candidate.CurrentLocation, candidate.HighestQualification, candidate.CreatedAt,
                historyDtos, []);
        }
    }
}
