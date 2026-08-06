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
            var latestSessionByProgress = await db.CandidateExamSessions
                .Where(s => s.CandidatePipelineProgressId != null && progressIds.Contains(s.CandidatePipelineProgressId.Value))
                .GroupBy(s => s.CandidatePipelineProgressId!.Value)
                .Select(g => new { 
                    ProgressId = g.Key, 
                    SessionId = g.Max(s => s.Id),
                    Score = g.OrderByDescending(s => s.Id).Select(s => (decimal?)s.Percentage).FirstOrDefault()
                })
                .ToDictionaryAsync(x => x.ProgressId, x => x, cancellationToken);

            var latestInterviewByProgress = await db.Interviews
                .Include(i => i.InterviewerUser)
                .Where(i => progressIds.Contains(i.CandidatePipelineProgressId) && i.Status != "Cancelled")
                .GroupBy(i => i.CandidatePipelineProgressId)
                .Select(g => g.OrderByDescending(i => i.Id).First())
                .ToDictionaryAsync(x => x.CandidatePipelineProgressId, x => new { x.Id, InterviewerName = x.InterviewerUser != null ? $"{x.InterviewerUser.FirstName} {x.InterviewerUser.LastName}".Trim() : null }, cancellationToken);

            var evaluatorUserIds = candidate.PipelineProgressHistory.Where(p => p.EvaluatorId != null).Select(p => p.EvaluatorId!.Value).Distinct().ToList();
            var evaluatorNames = await db.Users
                .Where(u => evaluatorUserIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim(), cancellationToken);

            // Offer isn't a pipeline round — it's a separate entity keyed only by CandidateId — so
            // the frontend needs this looked up here the same way CandidateExamSessionId/InterviewId
            // are looked up per-round above, otherwise there's no way to know an OfferLetterId exists
            // to call GetOfferById/ApproveOffer/download against.
            var latestOffer = await db.OfferLetters
                .Where(o => o.CandidateId == candidate.Id)
                .OrderByDescending(o => o.Id)
                .Select(o => new { o.Id, o.Status })
                .FirstOrDefaultAsync(cancellationToken);

            return new CandidateDto(
                candidate.Id, candidate.CandidateCode, candidate.FirstName, candidate.LastName, candidate.Email, candidate.Phone,
                candidate.VacancyId, candidate.Vacancy.Title, candidate.CurrentStage, candidate.Status, candidate.RegistrationChannel,
                candidate.ReferralEmployeeName, candidate.TotalExperienceYears, candidate.CurrentCTC, candidate.ExpectedCTC,
                candidate.NoticePeriodDays, candidate.CurrentLocation, candidate.HighestQualification, candidate.CreatedAt,
                candidate.PipelineProgressHistory.OrderBy(p => p.RoundNumber)
                    .Select(p => {
                        var sessInfo = latestSessionByProgress.GetValueOrDefault(p.Id);
                        var interviewInfo = latestInterviewByProgress.GetValueOrDefault(p.Id);
                        var effectiveScore = p.ScoreObtained ?? sessInfo?.Score;
                        var interviewerName = interviewInfo?.InterviewerName ?? (p.EvaluatorId != null ? evaluatorNames.GetValueOrDefault(p.EvaluatorId.Value) : null);

                        return new PipelineProgressDto(
                            p.Id, p.RoundNumber, p.RoundTitle, p.RoundType, p.Status, effectiveScore, p.StartedAt, p.CompletedAt,
                            sessInfo?.SessionId, interviewInfo?.Id, p.Remarks, interviewerName);
                    })
                    .ToList(),
                candidate.Documents
                    .Select(d => new CandidateDocumentDto(d.Id, d.DocumentType, d.FileName, d.ContentType, d.FileSizeBytes, d.StorageProvider, d.UploadedAt))
                    .ToList(),
                latestOffer?.Id, latestOffer?.Status);
        }
    }
}
