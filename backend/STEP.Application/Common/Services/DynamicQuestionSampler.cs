using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Exam;
using STEP.Domain.Entities.Master;

namespace STEP.Application.Common.Services
{
    public class DynamicQuestionSampler : IDynamicQuestionSampler
    {
        private readonly IApplicationDbContext _context;

        public DynamicQuestionSampler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PoolValidationResult> ValidatePoolAvailabilityAsync(
            int blueprintOrProfileId,
            CancellationToken cancellationToken)
        {
            // 1. Try resolving AssessmentBlueprint (V2 universal model)
            var blueprint = await _context.AssessmentBlueprints
                .Include(b => b.SectionRules.Where(r => r.IsActive))
                .FirstOrDefaultAsync(b => b.Id == blueprintOrProfileId, cancellationToken);

            if (blueprint != null)
            {
                var result = new PoolValidationResult { IsReady = true };

                foreach (var rule in blueprint.SectionRules.OrderBy(r => r.DisplayOrder))
                {
                    var query = _context.MasterQuestions
                        .Where(q => q.IsActive && q.SectionType == rule.SectionType && q.QuestionType == rule.QuestionType);

                    var availableCount = await query.CountAsync(cancellationToken);
                    var isSectionReady = availableCount >= rule.QuestionCount;
                    var missing = isSectionReady ? 0 : (rule.QuestionCount - availableCount);

                    if (!isSectionReady)
                    {
                        result.IsReady = false;
                    }

                    result.TotalRequiredQuestions += rule.QuestionCount;
                    result.TotalAvailableQuestions += availableCount;
                    result.SectionStatuses.Add(new SectionPoolStatus
                    {
                        SectionRuleId = rule.Id,
                        SectionName = rule.SectionName,
                        RequiredCount = rule.QuestionCount,
                        AvailableCount = availableCount,
                        IsReady = isSectionReady,
                        MissingCount = missing
                    });
                }

                if (!result.IsReady)
                {
                    var failedSections = result.SectionStatuses.Where(s => !s.IsReady).ToList();
                    result.ErrorMessage = $"Assessment pool deficit: {string.Join(", ", failedSections.Select(s => $"'{s.SectionName}' requires {s.RequiredCount} (Available: {s.AvailableCount}, Missing: {s.MissingCount})"))}.";
                }

                return result;
            }

            // Fallback for legacy RoleHiringProfile
            return new PoolValidationResult { IsReady = true, TotalRequiredQuestions = 0, TotalAvailableQuestions = 0 };
        }

        public async Task<List<CandidateExamSessionQuestion>> SampleAndLockQuestionsAsync(
            RoleHiringProfile profile,
            int candidateId,
            int vacancyId,
            string sessionToken,
            CancellationToken cancellationToken)
        {
            var seed = candidateId ^ vacancyId ^ (sessionToken?.GetHashCode() ?? 0);
            var rng = new Random(seed);

            var sampledQuestions = new List<CandidateExamSessionQuestion>();
            var usedMasterQuestionIds = new HashSet<int>();
            int globalDisplayOrder = 1;

            var activeRules = profile.SectionRules?.Where(r => r.IsActive).OrderBy(r => r.DisplayOrder).ToList()
                ?? new List<RoleAssessmentSectionRule>();

            foreach (var rule in activeRules)
            {
                var query = _context.MasterQuestions
                    .Include(q => q.Options)
                    .Where(q => q.IsActive && q.SectionType == rule.SectionType);

                var eligiblePool = await query.ToListAsync(cancellationToken);
                eligiblePool = eligiblePool.Where(q => !usedMasterQuestionIds.Contains(q.Id)).ToList();

                var shuffledPool = eligiblePool.OrderBy(_ => rng.Next()).Take(rule.QuestionCount).ToList();

                foreach (var masterQ in shuffledPool)
                {
                    usedMasterQuestionIds.Add(masterQ.Id);

                    var shuffledOptions = masterQ.Options
                        .OrderBy(_ => rng.Next())
                        .Select((opt, optIdx) => new CandidateExamSessionQuestionOption
                        {
                            OriginalMasterQuestionOptionId = opt.Id,
                            DisplayOrder = optIdx + 1,
                            OriginalOrder = opt.DisplayOrder,
                            DisplayOptionLabel = ((char)('A' + optIdx)).ToString(),
                            OptionText = opt.OptionText,
                            IsCorrect = opt.IsCorrect
                        })
                        .ToList();

                    var snapshotDto = new
                    {
                        MasterQuestionId = masterQ.Id,
                        masterQ.SectionType,
                        masterQ.QuestionType,
                        masterQ.ExperienceTier,
                        masterQ.QuestionText,
                        masterQ.Marks,
                        masterQ.Language,
                        masterQ.SqlSchema,
                        Options = shuffledOptions.Select(o => new
                        {
                            o.OriginalMasterQuestionOptionId,
                            o.DisplayOrder,
                            o.DisplayOptionLabel,
                            o.OptionText
                        })
                    };

                    var sessionQuestion = new CandidateExamSessionQuestion
                    {
                        OriginalMasterQuestionId = masterQ.Id,
                        OriginalQuestionVersion = 1,
                        SectionName = rule.SectionName,
                        SectionType = rule.SectionType,
                        DisplayOrder = globalDisplayOrder++,
                        OriginalOrder = masterQ.Id,
                        QuestionType = masterQ.QuestionType,
                        QuestionText = masterQ.QuestionText,
                        Marks = rule.MarksPerQuestion > 0 ? rule.MarksPerQuestion : masterQ.Marks,
                        TimeAllowedMinutes = rule.TimeLimitMinutes,
                        ProgrammingLanguage = masterQ.Language,
                        SqlSchema = masterQ.SqlSchema,
                        QuestionSnapshotJson = JsonSerializer.Serialize(snapshotDto),
                        Options = shuffledOptions
                    };

                    sampledQuestions.Add(sessionQuestion);
                }
            }

            return sampledQuestions;
        }
    }
}
