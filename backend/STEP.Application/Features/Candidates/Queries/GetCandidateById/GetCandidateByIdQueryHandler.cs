using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.Candidates.Queries.GetCandidateById
{
    public class GetCandidateByIdQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser) : IRequestHandler<GetCandidateByIdQuery, CandidateDto>
    {
        public async Task<CandidateDto> Handle(GetCandidateByIdQuery request, CancellationToken cancellationToken)
        {
            var candidate = await db.Candidates
                .Include(c => c.Vacancy)
                .Include(c => c.PipelineProgressHistory)
                .Include(c => c.Documents)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateEntity), request.Id);

            // Same restriction as GetCandidatesQueryHandler's list filter — an Interviewer who
            // isn't assigned to this candidate gets the same 404 as if the candidate didn't exist,
            // so a direct URL visit can't be used to route around the list-level filtering.
            if (currentUser.Role == "Interviewer" && currentUser.UserId is int interviewerId)
            {
                var isAssigned = await db.Interviews.AnyAsync(i => i.CandidateId == candidate.Id && i.InterviewerUserId == interviewerId, cancellationToken);
                if (!isAssigned)
                {
                    throw new NotFoundException(nameof(CandidateEntity), request.Id);
                }
            }

            // CandidatePipelineProgress has no direct navigation to CandidateExamSession — the
            // evaluation view needs this id to know which session to fetch, so it's looked up
            // separately here (most recent session per round, matching the resume-on-reconnect
            // semantics StartExamSessionCommandHandler already uses).
            var progressIds = candidate.PipelineProgressHistory.Select(p => p.Id).ToList();
            var latestSessionIdByProgress = await db.CandidateExamSessions
                .Where(s => s.CandidatePipelineProgressId != null && progressIds.Contains(s.CandidatePipelineProgressId.Value))
                .GroupBy(s => s.CandidatePipelineProgressId!.Value)
                .Select(g => new { ProgressId = g.Key, SessionId = g.Max(s => s.Id) })
                .ToDictionaryAsync(x => x.ProgressId, x => x.SessionId, cancellationToken);

            // Same idea as CandidateExamSessionId above — the Submit Feedback screen needs to know
            // which Interview row (if any) has been scheduled for a given round.
            var latestInterviewIdByProgress = await db.Interviews
                .Where(i => progressIds.Contains(i.CandidatePipelineProgressId))
                .GroupBy(i => i.CandidatePipelineProgressId)
                .Select(g => new { ProgressId = g.Key, InterviewId = g.Max(i => i.Id) })
                .ToDictionaryAsync(x => x.ProgressId, x => x.InterviewId, cancellationToken);

            return new CandidateDto(
                candidate.Id, candidate.CandidateCode, candidate.FirstName, candidate.LastName, candidate.Email, candidate.Phone,
                candidate.VacancyId, candidate.Vacancy.Title, candidate.CurrentStage, candidate.Status, candidate.RegistrationChannel,
                candidate.ReferralEmployeeName, candidate.TotalExperienceYears, candidate.CurrentCTC, candidate.ExpectedCTC,
                candidate.NoticePeriodDays, candidate.CurrentLocation, candidate.HighestQualification, candidate.CreatedAt,
                candidate.PipelineProgressHistory.OrderBy(p => p.RoundNumber)
                    .Select(p => new PipelineProgressDto(p.Id, p.RoundNumber, p.RoundTitle, p.RoundType, p.Status, p.ScoreObtained, p.StartedAt, p.CompletedAt,
                        latestSessionIdByProgress.GetValueOrDefault(p.Id), latestInterviewIdByProgress.GetValueOrDefault(p.Id)))
                    .ToList(),
                candidate.Documents
                    .Select(d => new CandidateDocumentDto(d.Id, d.DocumentType, d.FileName, d.ContentType, d.FileSizeBytes, d.StorageProvider, d.UploadedAt))
                    .ToList());
        }
    }
}
