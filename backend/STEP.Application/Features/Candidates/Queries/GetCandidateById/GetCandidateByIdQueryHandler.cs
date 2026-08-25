using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common;
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
                    .ThenInclude(v => v.PipelineFlows)
                        .ThenInclude(f => f.Rounds)
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

            // Look up V2 exam sessions first, then V1 sessions
            var latestSessionByProgress = new Dictionary<int, (int SessionId, decimal? Score)>();

            var v2Sessions = await db.CandidateExamSessionsV2
                .Where(s => s.CandidateId == candidate.Id)
                .OrderByDescending(s => s.Id)
                .ToListAsync(cancellationToken);

            foreach (var s in v2Sessions)
            {
                var progId = s.CandidatePipelineProgressId ?? progressIds.FirstOrDefault();
                if (progId > 0 && !latestSessionByProgress.ContainsKey(progId))
                {
                    latestSessionByProgress[progId] = (s.Id, (decimal?)s.Percentage);
                }
            }



            var interviews = progressIds.Count > 0
                ? await db.Interviews
                    .Include(i => i.InterviewerUser)
                    .Where(i => progressIds.Contains(i.CandidatePipelineProgressId) && i.Status != "Cancelled")
                    .ToListAsync(cancellationToken)
                : [];

            var latestInterviewByProgress = interviews
                .GroupBy(i => i.CandidatePipelineProgressId)
                .ToDictionary(
                    g => g.Key,
                    g => {
                        var latest = g.OrderByDescending(i => i.Id).First();
                        var name = latest.InterviewerUser != null ? $"{latest.InterviewerUser.FirstName} {latest.InterviewerUser.LastName}".Trim() : null;
                        return new { latest.Id, InterviewerName = name };
                    });

            var evaluatorUserIds = candidate.PipelineProgressHistory.Where(p => p.EvaluatorId != null).Select(p => p.EvaluatorId!.Value).Distinct().ToList();
            var evaluatorNames = evaluatorUserIds.Count > 0
                ? await db.Users
                    .Where(u => evaluatorUserIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}".Trim(), cancellationToken)
                : [];

            // Offer isn't a pipeline round — it's a separate entity keyed only by CandidateId — so
            // the frontend needs this looked up here the same way CandidateExamSessionId/InterviewId
            // are looked up per-round above, otherwise there's no way to know an OfferLetterId exists
            // to call GetOfferById/ApproveOffer/download against.
            var latestOffer = await db.OfferLetters
                .Where(o => o.CandidateId == candidate.Id)
                .OrderByDescending(o => o.Id)
                .Select(o => new { o.Id, o.Status })
                .FirstOrDefaultAsync(cancellationToken);

            // Merge full pipeline template rounds from candidate's vacancy so the hiring flow
            // always reflects all configured rounds (e.g. 1: Aptitude, 2: Technical, 3: Technical F2F, 4: Director & Offer).
            var defaultFlow = candidate.Vacancy?.PipelineFlows?.FirstOrDefault(f => f.IsDefault && !f.IsDeleted)
                ?? candidate.Vacancy?.PipelineFlows?.FirstOrDefault(f => !f.IsDeleted);

            var flowRounds = defaultFlow?.Rounds?.Where(r => !r.IsDeleted).OrderBy(r => r.RoundOrder).ToList() ?? [];
            var progressByRoundOrder = candidate.PipelineProgressHistory
                .GroupBy(p => p.RoundNumber)
                .ToDictionary(g => g.Key, g => g.OrderByDescending(p => p.Id).First());

            var combinedProgressDtos = new List<PipelineProgressDto>();

            if (flowRounds.Count > 0)
            {
                foreach (var r in flowRounds)
                {
                    if (progressByRoundOrder.TryGetValue(r.RoundOrder, out var p))
                    {
                        var hasSess = latestSessionByProgress.TryGetValue(p.Id, out var sessInfo);
                        var interviewInfo = latestInterviewByProgress.GetValueOrDefault(p.Id);
                        var isAutoPassed = (p.RoundTitle ?? r.Name).Contains("Auto-Passed", StringComparison.OrdinalIgnoreCase);
                        var effectiveStatus = isAutoPassed && (p.Status == "Pending" || string.IsNullOrWhiteSpace(p.Status)) ? "Passed" : p.Status;
                        var effectiveScore = p.ScoreObtained ?? (isAutoPassed ? 100.00m : (hasSess ? sessInfo.Score : null));
                        var interviewerName = interviewInfo?.InterviewerName ?? (p.EvaluatorId != null ? evaluatorNames.GetValueOrDefault(p.EvaluatorId.Value) : (isAutoPassed ? "System Auto-Screening" : null));

                        combinedProgressDtos.Add(new PipelineProgressDto(
                            p.Id, p.RoundNumber, p.RoundTitle ?? r.Name, p.RoundType ?? PipelineRoundClassification.Classify(r.RoundType),
                            effectiveStatus, effectiveScore, p.StartedAt, p.CompletedAt,
                            hasSess ? sessInfo.SessionId : null, interviewInfo?.Id, p.Remarks, interviewerName));
                    }
                    else
                    {
                        var isAutoPassed = r.Name.Contains("Auto-Passed", StringComparison.OrdinalIgnoreCase);
                        var defaultStatus = isAutoPassed ? "Passed" : "Pending";
                        var defaultScore = isAutoPassed ? 100.00m : (decimal?)null;
                        var defaultInterviewer = isAutoPassed ? "System Auto-Screening" : null;

                        combinedProgressDtos.Add(new PipelineProgressDto(
                            0, r.RoundOrder, r.Name, PipelineRoundClassification.Classify(r.RoundType),
                            defaultStatus, defaultScore, null, null, null, null, null, defaultInterviewer));
                    }
                }
            }
            else
            {
                combinedProgressDtos = candidate.PipelineProgressHistory.OrderBy(p => p.RoundNumber)
                    .Select(p => {
                        var hasSess = latestSessionByProgress.TryGetValue(p.Id, out var sessInfo);
                        var interviewInfo = latestInterviewByProgress.GetValueOrDefault(p.Id);
                        var isAutoPassed = (p.RoundTitle ?? string.Empty).Contains("Auto-Passed", StringComparison.OrdinalIgnoreCase);
                        var effectiveStatus = isAutoPassed && (p.Status == "Pending" || string.IsNullOrWhiteSpace(p.Status)) ? "Passed" : p.Status;
                        var effectiveScore = p.ScoreObtained ?? (isAutoPassed ? 100.00m : (hasSess ? sessInfo.Score : null));
                        var interviewerName = interviewInfo?.InterviewerName ?? (p.EvaluatorId != null ? evaluatorNames.GetValueOrDefault(p.EvaluatorId.Value) : (isAutoPassed ? "System Auto-Screening" : null));

                        return new PipelineProgressDto(
                            p.Id, p.RoundNumber, p.RoundTitle, p.RoundType, effectiveStatus, effectiveScore, p.StartedAt, p.CompletedAt,
                            hasSess ? sessInfo.SessionId : null, interviewInfo?.Id, p.Remarks, interviewerName);
                    })
                    .ToList();
            }

            return new CandidateDto(
                candidate.Id, candidate.CandidateCode, candidate.FirstName, candidate.LastName, candidate.Email, candidate.Phone,
                candidate.VacancyId, candidate.Vacancy?.Title ?? "Position", candidate.CurrentStage, candidate.Status, candidate.RegistrationChannel,
                candidate.ReferralEmployeeName, candidate.TotalExperienceYears, candidate.CurrentCTC, candidate.ExpectedCTC,
                candidate.NoticePeriodDays, candidate.CurrentLocation, candidate.HighestQualification, candidate.CreatedAt,
                combinedProgressDtos,
                candidate.Documents
                    .Select(d => new CandidateDocumentDto(d.Id, d.DocumentType, d.FileName, d.ContentType, d.FileSizeBytes, d.StorageProvider, d.UploadedAt))
                    .ToList(),
                latestOffer?.Id, latestOffer?.Status);
        }
    }
}
