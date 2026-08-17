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
            int roleHiringProfileId,
            CancellationToken cancellationToken)
        {
            var profile = await _context.RoleHiringProfiles
                .Include(p => p.SectionRules.Where(r => r.IsActive))
                .FirstOrDefaultAsync(p => p.Id == roleHiringProfileId, cancellationToken);

            if (profile == null)
            {
                return new PoolValidationResult
                {
                    IsReady = false,
                    ErrorMessage = $"Role hiring profile ID {roleHiringProfileId} not found."
                };
            }

            var result = new PoolValidationResult { IsReady = true };

            foreach (var rule in profile.SectionRules.OrderBy(r => r.DisplayOrder))
            {
                var query = _context.MasterQuestions
                    .Where(q => q.IsActive && q.SectionType == rule.SectionType);

                if (rule.SectionType != "Aptitude")
                {
                    query = query.Where(q => q.MasterRoleId == profile.MasterRoleId || q.MasterRoleId == null);
                }

                if (!string.Equals(rule.Difficulty, "Any", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(q => q.Difficulty == rule.Difficulty);
                }

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

                if (rule.SectionType != "Aptitude")
                {
                    query = query.Where(q => q.MasterRoleId == profile.MasterRoleId || q.MasterRoleId == null);
                }

                if (!string.Equals(rule.Difficulty, "Any", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(q => q.Difficulty == rule.Difficulty);
                }

                var eligiblePool = await query.ToListAsync(cancellationToken);
                eligiblePool = eligiblePool.Where(q => !usedMasterQuestionIds.Contains(q.Id)).ToList();

                // Deterministic Shuffle using Fisher-Yates with candidate seed
                var shuffledPool = eligiblePool.OrderBy(_ => rng.Next()).Take(rule.QuestionCount).ToList();

                foreach (var masterQ in shuffledPool)
                {
                    usedMasterQuestionIds.Add(masterQ.Id);

                    // Candidate-specific option shuffling
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
                        masterQ.Difficulty,
                        masterQ.QuestionText,
                        masterQ.Marks,
                        masterQ.ProgrammingLanguage,
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
                        TimeAllowedMinutes = rule.TimeLimitMinutes ?? masterQ.TimeAllowedMinutes,
                        ProgrammingLanguage = rule.ProgrammingLanguage ?? masterQ.ProgrammingLanguage,
                        SqlSchema = masterQ.SqlSchema,
                        MaxWordCount = masterQ.MaxWordCount,
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
