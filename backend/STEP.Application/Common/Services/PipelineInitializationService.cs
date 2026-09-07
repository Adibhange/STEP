using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;
using STEP.Domain.Entities.Candidate;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Application.Common.Services
{
    public class PipelineInitializationService(IApplicationDbContext db, IPasswordHasher hasher) : IPipelineInitializationService
    {
        public async Task<List<PipelineProgressDto>> InitializeCandidatePipelineAsync(
            CandidateEntity candidate, 
            VacancyEntity vacancy, 
            bool isDirect, 
            CancellationToken cancellationToken)
        {
            var defaultFlow = await db.VacancyPipelineFlows
                .Include(f => f.Rounds)
                .FirstOrDefaultAsync(f => f.VacancyId == vacancy.Id && f.IsDefault && !f.IsDeleted, cancellationToken)
                ?? await db.VacancyPipelineFlows
                .Include(f => f.Rounds)
                .FirstOrDefaultAsync(f => f.VacancyId == vacancy.Id && !f.IsDeleted, cancellationToken);

            if (defaultFlow == null)
            {
                // Fallback to auto-provision canonical rounds if no flow defined
                defaultFlow = new VacancyPipelineFlow
                {
                    VacancyId = vacancy.Id,
                    VersionName = "Standard Template",
                    Description = "Auto-provisioned standard pipeline",
                    IsDefault = true,
                    Rounds = new List<VacancyPipelineFlowRound>
                    {
                        new VacancyPipelineFlowRound { RoundOrder = 1, Name = "Aptitude & Screening", RoundType = "Assessment" },
                        new VacancyPipelineFlowRound { RoundOrder = 2, Name = "Technical Assignment", RoundType = "Assessment" },
                        new VacancyPipelineFlowRound { RoundOrder = 3, Name = "Technical Interview", RoundType = "Interview" },
                        new VacancyPipelineFlowRound { RoundOrder = 4, Name = "Director / HR Final", RoundType = "Interview" }
                    }
                };
                db.VacancyPipelineFlows.Add(defaultFlow);
                await db.SaveChangesAsync(cancellationToken);
            }

            var roundDefs = defaultFlow.Rounds.Where(r => !r.IsDeleted).OrderBy(r => r.RoundOrder).ToList();
            var progressList = new List<CandidatePipelineProgress>();
            var now = DateTime.UtcNow;

            foreach (var roundDef in roundDefs)
            {
                var progress = new CandidatePipelineProgress
                {
                    CandidateId = candidate.Id,
                    VacancyPipelineFlowRoundId = roundDef.Id,
                    RoundNumber = roundDef.RoundOrder,
                    RoundTitle = roundDef.Name,
                    RoundType = PipelineRoundClassification.Classify(roundDef.RoundType ?? "Assessment"),
                    Status = "Pending"
                };

                if (isDirect)
                {
                    if (roundDef.RoundOrder == 1)
                    {
                        progress.Status = "Passed";
                        progress.ScoreObtained = 100.00m;
                        progress.StartedAt = now;
                        progress.CompletedAt = now;
                        progress.Remarks = "HR Sourced & Pre-Qualified Direct Applicant";
                    }
                    else if (roundDef.RoundOrder == 2)
                    {
                        progress.Status = "Pending";
                        candidate.CurrentPipelineProgress = progress;
                        candidate.CurrentStage = roundDef.Name;
                        if (progress.RoundType == "Assessment")
                        {
                            var passcodeStr = Convert.ToHexString(RandomNumberGenerator.GetBytes(4));
                            candidate.ExamPasscodeHash = hasher.Hash(passcodeStr);
                        }
                    }
                }
                else // Walk-in
                {
                    if (roundDef.RoundOrder == 1)
                    {
                        progress.Status = "Ready";
                        progress.StartedAt = now;
                        var passcode = "1234";
                        candidate.ExamPasscodeHash = hasher.Hash(passcode);
                        candidate.CurrentPipelineProgress = progress;
                        candidate.CurrentStage = roundDef.Name;
                    }
                }

                progressList.Add(progress);
                db.CandidatePipelineProgresses.Add(progress);
            }

            candidate.PipelineProgressHistory = progressList;

            // Wait for Identity generation of CandidatePipelineProgress Ids
            await db.SaveChangesAsync(cancellationToken);

            if (isDirect)
            {
                var round2 = progressList.FirstOrDefault(p => p.RoundNumber == 2);
                if (round2 != null) candidate.CurrentPipelineProgressId = round2.Id;
            }
            else
            {
                var round1 = progressList.FirstOrDefault(p => p.RoundNumber == 1);
                if (round1 != null) candidate.CurrentPipelineProgressId = round1.Id;
            }

            await db.SaveChangesAsync(cancellationToken);

            return progressList.Select(p => new PipelineProgressDto(
                p.Id,
                p.RoundNumber,
                p.RoundTitle,
                p.RoundType,
                p.Status,
                p.ScoreObtained,
                p.StartedAt,
                p.CompletedAt,
                null,
                null,
                p.Remarks,
                null,
                null
            )).ToList();
        }
    }
}
