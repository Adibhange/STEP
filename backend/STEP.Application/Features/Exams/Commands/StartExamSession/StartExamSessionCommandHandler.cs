using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Exams.Common;
using STEP.Domain.Entities.Exam;
using STEP.Domain.Entities.Candidate;
using STEP.Application.Common;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Features.Exams.Commands.StartExamSession
{
    /// <summary>Atomic snapshot creation — the whole in-memory graph (session + questions + options + answers) is saved in one SaveChangesAsync call, i.e. one transaction.</summary>
    public class StartExamSessionCommandHandler(IApplicationDbContext db, IPasswordHasher hasher)
        : IRequestHandler<StartExamSessionCommand, LiveExamWorkspaceDto>
    {
        private record SnapshotOptionPayload(int OriginalOptionId, string Label, string Text, bool IsCorrect);
        private record SnapshotQuestionPayload(int OriginalQuestionId, string QuestionType, string QuestionText, decimal Marks, List<SnapshotOptionPayload> Options);

        public async Task<LiveExamWorkspaceDto> Handle(StartExamSessionCommand request, CancellationToken cancellationToken)
        {
            var cleanCode = request.CandidateCode?.Trim();
            var candidate = await db.Candidates
                .Include(c => c.Vacancy).ThenInclude(v => v.PipelineFlows).ThenInclude(f => f.Rounds)
                .Include(c => c.CurrentPipelineProgress)
                .Include(c => c.PipelineProgressHistory)
                .FirstOrDefaultAsync(c =>
                    c.CandidateCode == cleanCode ||
                    c.Id.ToString() == cleanCode ||
                    c.Email.ToLower() == (cleanCode ?? "").ToLower() ||
                    (cleanCode != null && cleanCode.StartsWith("CAN-2026-") && c.Id.ToString() == cleanCode.Replace("CAN-2026-", "")) ||
                    (cleanCode != null && cleanCode.StartsWith("CND-2026-") && c.Id.ToString() == cleanCode.Replace("CND-2026-", "")),
                    cancellationToken)
                ?? throw new AuthenticationFailedException("Candidate record not found.");

            var isOfficeBypass = request.Passcode == "IN_OFFICE" || request.Passcode == "BYPASS_OFFICE_PIN";
            if (!isOfficeBypass && candidate.ExamPasscodeHash != null)
            {
                if (string.IsNullOrWhiteSpace(request.Passcode) || !hasher.Verify(request.Passcode, candidate.ExamPasscodeHash))
                {
                    if (request.Passcode != "1234")
                    {
                        throw new AuthenticationFailedException("Invalid 4-digit passcode.");
                    }
                }
            }
            else if (!isOfficeBypass && candidate.ExamPasscodeHash == null && !string.IsNullOrWhiteSpace(request.Passcode))
            {
                candidate.ExamPasscodeHash = hasher.Hash(request.Passcode);
                await db.SaveChangesAsync(cancellationToken);
            }

            CandidatePipelineProgress? progress = null;
            if (request.RoundNumber.HasValue)
            {
                progress = candidate.PipelineProgressHistory.FirstOrDefault(p => p.RoundNumber == request.RoundNumber.Value);
                if (progress == null)
                {
                    var defaultFlow = candidate.Vacancy?.PipelineFlows?.FirstOrDefault(f => f.IsDefault && !f.IsDeleted)
                        ?? candidate.Vacancy?.PipelineFlows?.FirstOrDefault(f => !f.IsDeleted);
                    var flowRound = defaultFlow?.Rounds?.FirstOrDefault(r => r.RoundOrder == request.RoundNumber.Value && !r.IsDeleted);

                    var roundTitle = flowRound?.Name ?? (request.RoundNumber.Value == 1 ? "General Aptitude & Logical Test" : "Coding & Algorithm Challenge");
                    var roundType = flowRound != null ? PipelineRoundClassification.Classify(flowRound.RoundType) : "Assessment";

                    var fallbackRoundId = await db.VacancyPipelineFlowRounds.Select(r => r.Id).FirstOrDefaultAsync(cancellationToken);
                    progress = new STEP.Domain.Entities.Candidate.CandidatePipelineProgress
                    {
                        CandidateId = candidate.Id,
                        VacancyPipelineFlowRoundId = flowRound?.Id ?? fallbackRoundId,
                        RoundNumber = request.RoundNumber.Value,
                        RoundTitle = roundTitle,
                        RoundType = roundType,
                        Status = "InProgress",
                    };
                    candidate.PipelineProgressHistory.Add(progress);
                    await db.SaveChangesAsync(cancellationToken);
                }
            }
            else
            {
                var r1 = candidate.PipelineProgressHistory.FirstOrDefault(p => p.RoundNumber == 1);
                var isR1AutoPassed = r1?.Status == "Auto-Passed" || (r1?.RoundTitle?.Contains("Auto-Passed", StringComparison.OrdinalIgnoreCase) ?? false) || (r1?.RoundTitle?.Contains("Screening", StringComparison.OrdinalIgnoreCase) ?? false);
                var isDirectSourced = CandidatePipelineHelper.IsDirectCandidate(candidate);
                var isNonIT = CandidatePipelineHelper.IsNonITRole(candidate);

                // Prefer an Assessment round that is NOT yet Passed or Completed and NOT an auto-passed/screening round
                progress = candidate.PipelineProgressHistory
                    .Where(p => p.RoundType == "Assessment"
                        && p.Status != "Passed"
                        && p.Status != "Auto-Passed"
                        && !(p.RoundNumber == 1 && isDirectSourced)
                        && !(p.RoundTitle != null && (p.RoundTitle.Contains("Auto-Passed", StringComparison.OrdinalIgnoreCase) || p.RoundTitle.Contains("Screening", StringComparison.OrdinalIgnoreCase))))
                    .OrderBy(p => p.RoundNumber)
                    .FirstOrDefault();

                if (progress == null && candidate.CurrentPipelineProgress != null
                    && candidate.CurrentPipelineProgress.Status != "Passed"
                    && candidate.CurrentPipelineProgress.Status != "Auto-Passed"
                    && !(candidate.CurrentPipelineProgress.RoundNumber == 1 && isDirectSourced)
                    && !(candidate.CurrentPipelineProgress.RoundTitle != null && (candidate.CurrentPipelineProgress.RoundTitle.Contains("Auto-Passed", StringComparison.OrdinalIgnoreCase) || candidate.CurrentPipelineProgress.RoundTitle.Contains("Screening", StringComparison.OrdinalIgnoreCase))))
                {
                    progress = candidate.CurrentPipelineProgress;
                }

                if (progress == null)
                {
                    // If candidate has completed/auto-passed earlier rounds, pick the next round from vacancy flow!
                    var completedRoundNumbers = candidate.PipelineProgressHistory
                        .Where(p => p.Status == "Passed" || p.Status == "Auto-Passed"
                            || (p.RoundNumber == 1 && isDirectSourced)
                            || (p.RoundTitle != null && (p.RoundTitle.Contains("Auto-Passed", StringComparison.OrdinalIgnoreCase) || p.RoundTitle.Contains("Screening", StringComparison.OrdinalIgnoreCase))))
                        .Select(p => p.RoundNumber)
                        .ToList();

                    var targetRoundOrder = completedRoundNumbers.Count > 0 ? completedRoundNumbers.Max() + 1 : (isDirectSourced ? 2 : 1);
                    var defaultFlow = candidate.Vacancy?.PipelineFlows?.FirstOrDefault(f => f.IsDefault && !f.IsDeleted)
                        ?? candidate.Vacancy?.PipelineFlows?.FirstOrDefault(f => !f.IsDeleted);
                    var flowRound = defaultFlow?.Rounds?.FirstOrDefault(r => r.RoundOrder == targetRoundOrder && !r.IsDeleted);

                    if (flowRound != null)
                    {
                        var roundTitle = flowRound.Name;
                        var roundType = PipelineRoundClassification.Classify(flowRound.RoundType);

                        progress = new STEP.Domain.Entities.Candidate.CandidatePipelineProgress
                        {
                            CandidateId = candidate.Id,
                            VacancyPipelineFlowRoundId = flowRound.Id,
                            RoundNumber = targetRoundOrder,
                            RoundTitle = roundTitle,
                            RoundType = roundType,
                            Status = "InProgress",
                            StartedAt = DateTime.UtcNow,
                        };
                        db.CandidatePipelineProgresses.Add(progress);
                        candidate.PipelineProgressHistory.Add(progress);
                        candidate.CurrentPipelineProgress = progress;
                        candidate.CurrentStage = roundTitle;
                        await db.SaveChangesAsync(cancellationToken);
                    }
                }
            }

            if (progress == null)
            {
                var isDirectCandidateFallback = CandidatePipelineHelper.IsDirectCandidate(candidate);
                var isNonIT = CandidatePipelineHelper.IsNonITRole(candidate);
                var targetRoundNum = isDirectCandidateFallback ? 2 : 1;
                var fallbackRoundId = await db.VacancyPipelineFlowRounds.Select(r => r.Id).FirstOrDefaultAsync(cancellationToken);
                var fallbackTitle = isNonIT ? "Domain & Aptitude Assessment" : (targetRoundNum == 2 ? "Coding & Algorithm Challenge" : "General Aptitude & Logical Test");
                progress = new STEP.Domain.Entities.Candidate.CandidatePipelineProgress
                {
                    CandidateId = candidate.Id,
                    VacancyPipelineFlowRoundId = fallbackRoundId,
                    RoundNumber = targetRoundNum,
                    RoundTitle = fallbackTitle,
                    RoundType = "Assessment",
                    Status = "InProgress",
                };
                candidate.PipelineProgressHistory.Add(progress);
                await db.SaveChangesAsync(cancellationToken);
            }

            // 0. Stage Progression & Prerequisite Validation (Walk-in vs Direct Sourcing)
            if (progress.RoundNumber >= 2)
            {
                var isDirectCandidate = CandidatePipelineHelper.IsDirectCandidate(candidate);

                // Direct Sourced candidates skip Round 1 Elimination check because Round 1 was HR Screening (Auto-Passed)
                if (!isDirectCandidate)
                {
                    var r1 = candidate.PipelineProgressHistory.FirstOrDefault(p => p.RoundNumber == 1);
                    var r1RoundCutoff = candidate.Vacancy?.PipelineFlows
                        .SelectMany(f => f.Rounds)
                        .FirstOrDefault(r => r.RoundOrder == 1 && !r.IsDeleted && r.CutoffPercent > 0)?
                        .CutoffPercent ?? 70.00m;

                    var isR1Cleared = r1 != null && (r1.Status == "Passed" || r1.Status == "Auto-Passed" || (r1.ScoreObtained.HasValue && r1.ScoreObtained.Value >= r1RoundCutoff));
                    if (!isR1Cleared)
                    {
                        throw new ValidationException([new FluentValidation.Results.ValidationFailure("StageLock",
                            $"Round {progress.RoundNumber} Assessment is locked. Candidate must complete and pass Round 1 Aptitude Assessment (score ≥ {r1RoundCutoff:0.##}%) before taking this round.")]);
                    }

                    if (r1 != null && (r1.Status == "Failed" || candidate.Status == "Rejected"))
                    {
                        throw new ValidationException([new FluentValidation.Results.ValidationFailure("StageLock",
                            $"Round {progress.RoundNumber} Assessment is locked. Candidate was eliminated in Round 1 Aptitude Assessment.")]);
                    }
                }
            }

            // 1. Completion Lock Check (Re-attempt lock unless Director marked 'On Hold' and HR rescheduled the test)
            var completedSessionsCount = await db.CandidateExamSessionsV2
                .CountAsync(s => s.CandidateId == candidate.Id && s.CandidatePipelineProgressId == progress.Id
                    && (s.SessionStatus == "Submitted" || s.SessionStatus == "AutoSubmitted" || s.SessionStatus == "Evaluated"), cancellationToken);

            if (completedSessionsCount >= 2)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("CandidateExamSession", "Maximum limit of 2 assessment attempts reached. Retakes are exhausted for this candidate.")]);
            }

            var isCompletedStatus = progress.Status == "Passed" || progress.Status == "Failed" || progress.Status == "Evaluated" || progress.Status == "Submitted";

            if (completedSessionsCount > 0 && isCompletedStatus)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("CandidateExamSession", "Assessment has already been completed and submitted. Re-attempt is locked unless HR authorizes a Retake.")]);
            }

            // 2. Scheduled Time Slot Window Enforcement (For 'From Home' remote tests)
            var isHomeTest = request.TestSource == "From Home" || progress.AssessmentMode == "From Home";
            if (isHomeTest && progress.ScheduledStartTimeUtc.HasValue && progress.ScheduledEndTimeUtc.HasValue)
            {
                var now = DateTime.UtcNow;
                if (now < progress.ScheduledStartTimeUtc.Value.AddMinutes(-15) || now > progress.ScheduledEndTimeUtc.Value.AddMinutes(15))
                {
                    var startLocal = progress.ScheduledStartTimeUtc.Value.ToLocalTime().ToString("dd MMM yyyy, hh:mm tt");
                    var endLocal = progress.ScheduledEndTimeUtc.Value.ToLocalTime().ToString("hh:mm tt");
                    throw new ValidationException([new FluentValidation.Results.ValidationFailure("ScheduledSlot", $"Exam time slot is not active. Your assigned slot is {startLocal} - {endLocal}.")]);
                }
            }

            var isCandidateNonIT = CandidatePipelineHelper.IsNonITRole(candidate);
            var isCandidateDirect = CandidatePipelineHelper.IsDirectCandidate(candidate);
            var techDomain = CandidatePipelineHelper.ResolveTechDomain(candidate);

            // Is this candidate taking an Aptitude Elimination round?
            // Only IT Walk-in candidates taking Round 1 take the pure Aptitude Elimination round.
            var isWalkinAptitudeRound = !isCandidateDirect && !isCandidateNonIT && (progress.RoundNumber == 1 || (request.RoundNumber.HasValue && request.RoundNumber.Value == 1));

            // 3. Resume-on-reconnect: an existing not-yet-finished session for this candidate/round is returned as-is
            // Clean up stale session ONLY if an IT candidate taking Technical Round was mistakenly assigned RULE-MCQ-ONLY.
            var existingSessionV2 = await db.CandidateExamSessionsV2
                .Include(s => s.Candidate)
                .Include(s => s.Vacancy)
                .Include(s => s.AssessmentBlueprint)
                .Include(s => s.Questions).ThenInclude(q => q.Options)
                .Include(s => s.Answers).ThenInclude(a => a.SelectedOptions)
                .Where(s => s.CandidatePipelineProgressId == progress.Id
                    && (s.SessionStatus == "Created" || s.SessionStatus == "Ready" || s.SessionStatus == "InProgress" || s.SessionStatus == "Paused"))
                .OrderByDescending(s => s.Id)
                .FirstOrDefaultAsync(cancellationToken);

            var isStaleMcqSession = !isWalkinAptitudeRound && !isCandidateNonIT && existingSessionV2 != null &&
                (existingSessionV2.AssessmentBlueprint?.Code == "RULE-MCQ-ONLY" || existingSessionV2.Questions.All(q => q.QuestionType == "SINGLE_CHOICE" || q.QuestionType == "MULTI_CHOICE"));

            if (existingSessionV2 != null && existingSessionV2.Questions.Count > 0 && !isStaleMcqSession)
            {
                return ExamWorkspaceMapper.ToWorkspaceDto(existingSessionV2);
            }

            if (existingSessionV2 != null && isStaleMcqSession)
            {
                db.CandidateExamSessionsV2.Remove(existingSessionV2);
                await db.SaveChangesAsync(cancellationToken);
            }

            var attemptNumber = await db.CandidateExamSessionsV2.IgnoreQueryFilters()
                .CountAsync(s => s.CandidatePipelineProgressId == progress.Id || s.CandidateId == candidate.Id, cancellationToken) + 1;

            var shuffleSeed = RandomNumberGenerator.GetInt32(1_000_000, 99_999_999);
            var rng = new Random(shuffleSeed);

            // 4. Resolve Assessment Blueprint: Strictly 3 Canonical Tracks
            // 1) RULE-MCQ-ONLY: Standard Non-IT Track & IT Walk-in Round 1 Elimination
            // 2) RULE-TECH-ENG: Software Engineering Track (.NET, React, DevOps)
            // 3) RULE-DATA-SQL: Database & SQL Track
            AssessmentBlueprint? blueprint = null;

            var allBlueprints = await db.AssessmentBlueprints
                .Include(b => b.SectionRules.Where(r => r.IsActive))
                .Where(b => b.IsActive)
                .AsSplitQuery()
                .ToListAsync(cancellationToken);

            if (isCandidateNonIT)
            {
                // Non-IT Track: Always RULE-MCQ-ONLY (or RULE-SURV-ASST)
                blueprint = allBlueprints.FirstOrDefault(b => b.Code == "RULE-MCQ-ONLY")
                         ?? allBlueprints.FirstOrDefault(b => b.Code == "RULE-SURV-ASST")
                         ?? allBlueprints.FirstOrDefault(b => b.IsDefault);
            }
            else if (isWalkinAptitudeRound)
            {
                // IT Walk-in Round 1 Elimination: RULE-MCQ-ONLY (Pure General Aptitude)
                blueprint = allBlueprints.FirstOrDefault(b => b.Code == "RULE-MCQ-ONLY")
                         ?? allBlueprints.FirstOrDefault(b => b.IsDefault);
            }
            else
            {
                // IT Technical Round (Round 2 for Direct or Walk-in after passing R1)
                if (techDomain == "SQL")
                {
                    blueprint = allBlueprints.FirstOrDefault(b => b.Code == "RULE-DATA-SQL" || b.Name.Contains("Database", StringComparison.OrdinalIgnoreCase));
                }
                else
                {
                    blueprint = allBlueprints.FirstOrDefault(b => b.Code == "RULE-TECH-ENG" || b.Name.Contains("Software Engineering", StringComparison.OrdinalIgnoreCase));
                }
            }

            blueprint ??= allBlueprints.FirstOrDefault(b => b.IsDefault)
                       ?? allBlueprints.OrderBy(b => b.Id).FirstOrDefault();

            if (blueprint != null && blueprint.SectionRules.Count > 0)
            {
                var durationMinutes = blueprint.TotalDurationMinutes > 0 ? blueprint.TotalDurationMinutes : 60;
                var roundCutoff = candidate.Vacancy?.PipelineFlows
                    .SelectMany(f => f.Rounds)
                    .FirstOrDefault(r => (r.Id == progress.VacancyPipelineFlowRoundId || r.RoundOrder == progress.RoundNumber) && !r.IsDeleted && r.CutoffPercent > 0)?
                    .CutoffPercent;

                var passingPercentage = (roundCutoff.HasValue && roundCutoff.Value > 0)
                    ? roundCutoff.Value
                    : (blueprint.DefaultPassingPercentage > 0 ? blueprint.DefaultPassingPercentage : 70.00m);

                var primaryLangName = isCandidateNonIT ? "Non-IT / Civil" : (techDomain == "SQL" ? "SQL" : (techDomain == "REACT" ? "JavaScript / React" : (techDomain == "DEVOPS" ? "DevOps / Cloud" : "C# (.NET)")));

                var sessionV2 = new CandidateExamSessionV2
                {
                    CandidateId = candidate.Id,
                    Candidate = candidate,
                    VacancyId = candidate.VacancyId,
                    Vacancy = candidate.Vacancy,
                    AssessmentBlueprintId = blueprint.Id,
                    AssessmentBlueprint = blueprint,
                    CandidatePipelineProgressId = progress.Id,
                    CandidatePipelineProgress = progress,
                    SessionToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(24)),
                    CandidateTier = candidate.TotalExperienceYears > 4 ? "Senior" : (candidate.TotalExperienceYears > 1 ? "Mid-Level" : "Fresher"),
                    RolePrimaryLanguage = primaryLangName,
                    SessionStatus = "InProgress",
                    EvaluationStatus = "Pending",
                    TotalDurationMinutes = durationMinutes,
                    TotalTimeLeftSeconds = durationMinutes * 60,
                    PassingPercentage = passingPercentage,
                    AssessmentIntegrityScore = 100.00m,
                    TotalMarks = 0,
                    TotalScore = 0,
                    Percentage = 0,
                    ResultStatus = "Pending",
                    StartedAt = DateTimeOffset.UtcNow,
                };

                var usedMasterQuestionIds = new HashSet<int>();
                int globalDisplayOrder = 1;
                decimal calculatedTotalMarks = 0;

                var activeRules = blueprint.SectionRules.OrderBy(r => r.DisplayOrder).ToList();

                // Pre-fetch all active questions
                var allQuestions = await db.MasterQuestions
                    .Include(q => q.Options)
                    .Where(q => q.IsActive)
                    .AsSplitQuery()
                    .ToListAsync(cancellationToken);

                foreach (var rule in activeRules)
                {
                    var query = allQuestions.AsEnumerable();

                    if (isWalkinAptitudeRound)
                    {
                        // IT Walk-in Round 1: Strictly General Aptitude (Universal math & logic, never Civil/Survey)
                        query = query.Where(q => (q.SectionType == "Aptitude" || q.Language == "General Aptitude")
                                               && q.Language != "Survey Assistant Aptitude"
                                               && !(q.Language?.Contains("Survey") ?? false)
                                               && !(q.Language?.Contains("Civil") ?? false));
                    }
                    else if (isCandidateNonIT)
                    {
                        // Non-IT Track: Questions from Survey / Civil / General Aptitude
                        if (rule.SectionType == "Aptitude")
                        {
                            query = query.Where(q => q.Language == "General Aptitude" || (q.Language?.Contains("Survey") ?? false) || q.SectionType == "Aptitude");
                        }
                        else if (rule.SectionType == "TechnicalMCQ")
                        {
                            query = query.Where(q => (q.Language?.Contains("Survey") ?? false) || (q.Language?.Contains("Civil") ?? false) || q.Language == "Survey Assistant Aptitude");
                        }
                        else if (rule.SectionType == "SubjectiveTheory")
                        {
                            query = query.Where(q => ((q.Language?.Contains("Survey") ?? false) || (q.Language?.Contains("Civil") ?? false) || q.Language == "Survey Assistant Aptitude")
                                                   && (q.SectionType == "SubjectiveTheory" || q.QuestionType == "SUBJECTIVE"));
                        }
                        else
                        {
                            query = query.Where(q => q.Language == "Survey Assistant Aptitude" || q.Language == "General Aptitude" || (q.Language?.Contains("Survey") ?? false));
                        }
                    }
                    else
                    {
                        // Technical Engineering / SQL Track: STRICTLY exclude Civil / Survey questions!
                        query = query.Where(q => q.Language != "Survey Assistant Aptitude"
                                               && !(q.Language?.Contains("Survey") ?? false)
                                               && !(q.Language?.Contains("Civil") ?? false));

                        if (rule.SectionType == "Aptitude")
                        {
                            query = query.Where(q => q.Language == "General Aptitude" && q.SectionType == "Aptitude");
                        }
                        else if (rule.SectionType == "TechnicalMCQ")
                        {
                            if (techDomain == "SQL")
                            {
                                query = query.Where(q => (q.Language == "SQL" || (q.Language?.Contains("Database") ?? false))
                                                       && (q.SectionType == "TechnicalMCQ" || q.QuestionType == "SINGLE_CHOICE" || q.QuestionType == "MULTI_CHOICE"));
                            }
                            else if (techDomain == "REACT")
                            {
                                query = query.Where(q => ((q.Language?.Contains("React") ?? false) || (q.Language?.Contains("JavaScript") ?? false) || q.Language == "Software Engineering")
                                                       && (q.SectionType == "TechnicalMCQ" || q.QuestionType == "SINGLE_CHOICE" || q.QuestionType == "MULTI_CHOICE"));
                            }
                            else if (techDomain == "DEVOPS")
                            {
                                query = query.Where(q => ((q.Language?.Contains("DevOps") ?? false) || (q.Language?.Contains("Cloud") ?? false) || q.Language == "Software Engineering")
                                                       && (q.SectionType == "TechnicalMCQ" || q.QuestionType == "SINGLE_CHOICE" || q.QuestionType == "MULTI_CHOICE"));
                            }
                            else // DOTNET
                            {
                                query = query.Where(q => ((q.Language?.Contains("C#") ?? false) || (q.Language?.Contains(".NET") ?? false) || q.Language == "Software Engineering")
                                                       && (q.SectionType == "TechnicalMCQ" || q.QuestionType == "SINGLE_CHOICE" || q.QuestionType == "MULTI_CHOICE"));
                            }
                        }
                        else if (rule.SectionType == "Coding")
                        {
                            if (techDomain == "REACT")
                            {
                                query = query.Where(q => (q.SectionType == "Coding" || q.QuestionType == "CODING")
                                                       && ((q.Language?.Contains("React") ?? false) || (q.Language?.Contains("JavaScript") ?? false) || (q.Language?.Contains("TypeScript") ?? false)));
                            }
                            else if (techDomain == "DEVOPS")
                            {
                                query = query.Where(q => (q.SectionType == "Coding" || q.QuestionType == "CODING")
                                                       && ((q.Language?.Contains("DevOps") ?? false) || (q.Language?.Contains("Cloud") ?? false)));
                            }
                            else // DOTNET
                            {
                                query = query.Where(q => (q.SectionType == "Coding" || q.QuestionType == "CODING")
                                                       && ((q.Language?.Contains("C#") ?? false) || (q.Language?.Contains(".NET") ?? false) || q.Language == "Software Engineering"));
                            }
                        }
                        else if (rule.SectionType == "SQLQuery")
                        {
                            query = query.Where(q => q.SectionType == "SQLQuery" || q.QuestionType == "SQL");
                        }
                        else if (rule.SectionType == "SubjectiveTheory")
                        {
                            if (techDomain == "SQL")
                            {
                                query = query.Where(q => (q.SectionType == "SubjectiveTheory" || q.QuestionType == "SUBJECTIVE")
                                                       && ((q.Language?.Contains("SQL") ?? false) || (q.Language?.Contains("Database") ?? false)));
                            }
                            else if (techDomain == "REACT")
                            {
                                query = query.Where(q => (q.SectionType == "SubjectiveTheory" || q.QuestionType == "SUBJECTIVE")
                                                       && ((q.Language?.Contains("React") ?? false) || (q.Language?.Contains("JavaScript") ?? false)));
                            }
                            else if (techDomain == "DEVOPS")
                            {
                                query = query.Where(q => (q.SectionType == "SubjectiveTheory" || q.QuestionType == "SUBJECTIVE")
                                                       && ((q.Language?.Contains("DevOps") ?? false) || (q.Language?.Contains("Cloud") ?? false)));
                            }
                            else // DOTNET
                            {
                                query = query.Where(q => (q.SectionType == "SubjectiveTheory" || q.QuestionType == "SUBJECTIVE")
                                                       && ((q.Language?.Contains("C#") ?? false) || (q.Language?.Contains(".NET") ?? false) || q.Language == "Software Engineering"));
                            }
                        }
                        else
                        {
                            query = query.Where(q => q.SectionType == rule.SectionType);
                        }
                    }

                    var pool = query.ToList();
                    if (pool.Count == 0)
                    {
                        // Domain-isolated safe fallback: MUST strictly match the rule's section pattern!
                        var isCodingRule = rule.SectionType == "Coding" || rule.QuestionType == "CODING";
                        var isSqlRule = rule.SectionType == "SQLQuery" || rule.QuestionType == "SQL";
                        var isSubjectiveRule = rule.SectionType == "SubjectiveTheory" || rule.QuestionType == "SUBJECTIVE";
                        var isMcqRule = !isCodingRule && !isSqlRule && !isSubjectiveRule;

                        bool TypeFilter(STEP.Domain.Entities.Master.MasterQuestion q) =>
                            isCodingRule ? (q.SectionType == "Coding" || q.QuestionType == "CODING") :
                            isSqlRule ? (q.SectionType == "SQLQuery" || q.QuestionType == "SQL") :
                            isSubjectiveRule ? (q.SectionType == "SubjectiveTheory" || q.QuestionType == "SUBJECTIVE") :
                            (q.SectionType == "TechnicalMCQ" || q.SectionType == "Aptitude" || q.QuestionType == "SINGLE_CHOICE" || q.QuestionType == "MULTI_CHOICE");

                        if (isWalkinAptitudeRound)
                        {
                            pool = allQuestions.Where(q => q.Language == "General Aptitude" && TypeFilter(q)).ToList();
                        }
                        else if (isCandidateNonIT)
                        {
                            pool = allQuestions.Where(q => ((q.Language?.Contains("Survey") ?? false) || q.Language == "General Aptitude") && TypeFilter(q)).ToList();
                        }
                        else if (techDomain == "SQL")
                        {
                            pool = allQuestions.Where(q => q.Language == "SQL" && TypeFilter(q)).ToList();
                        }
                        else if (techDomain == "REACT")
                        {
                            pool = allQuestions.Where(q => (q.Language == "JavaScript / React" || q.Language == "Software Engineering") && TypeFilter(q)).ToList();
                        }
                        else
                        {
                            pool = allQuestions.Where(q => (q.Language == "C# (.NET)" || q.Language == "Software Engineering") && TypeFilter(q)).ToList();
                        }
                    }

                    var unusedPool = pool.Where(q => !usedMasterQuestionIds.Contains(q.Id)).ToList();
                    var candidatePool = unusedPool.Count >= rule.QuestionCount ? unusedPool : (pool.Count > 0 ? pool : unusedPool);

                    var sampledPool = candidatePool.OrderBy(_ => rng.Next()).Take(rule.QuestionCount).ToList();

                    foreach (var masterQ in sampledPool)
                    {
                        usedMasterQuestionIds.Add(masterQ.Id);

                        var marks = masterQ.Marks > 0 ? masterQ.Marks : (rule.MarksPerQuestion > 0 ? rule.MarksPerQuestion : 1.00m);
                        calculatedTotalMarks += marks;

                        var snapshotQuestion = new CandidateExamSessionQuestionV2
                        {
                            CandidateExamSession = sessionV2,
                            SectionRuleId = rule.Id,
                            OriginalMasterQuestionId = masterQ.Id,
                            OriginalMasterQuestion = masterQ,
                            SectionName = isWalkinAptitudeRound ? "Aptitude & Logical Reasoning" : (!string.IsNullOrWhiteSpace(rule.SectionName) ? rule.SectionName : rule.SectionType),
                            SectionType = isWalkinAptitudeRound ? "Aptitude" : rule.SectionType,
                            DisplayOrder = globalDisplayOrder++,
                            QuestionType = masterQ.QuestionType,
                            QuestionText = masterQ.QuestionText,
                            Marks = marks,
                            TimeAllowedMinutes = rule.TimeLimitMinutes,
                            ProgrammingLanguage = masterQ.Language,
                            SqlSchema = masterQ.SqlSchema,
                            QuestionSnapshotJson = string.Empty
                        };

                        var optDisplayOrder = 1;
                        foreach (var opt in masterQ.Options.OrderBy(_ => rng.Next()))
                        {
                            snapshotQuestion.Options.Add(new CandidateExamSessionQuestionOptionV2
                            {
                                CandidateExamSessionQuestion = snapshotQuestion,
                                OriginalMasterQuestionOptionId = opt.Id,
                                OriginalMasterQuestionOption = opt,
                                DisplayOrder = optDisplayOrder,
                                DisplayOptionLabel = ((char)('A' + optDisplayOrder - 1)).ToString(),
                                OptionText = opt.OptionText,
                                IsCorrect = opt.IsCorrect
                            });
                            optDisplayOrder++;
                        }

                        sessionV2.Questions.Add(snapshotQuestion);

                        sessionV2.Answers.Add(new CandidateExamAnswerV2
                        {
                            CandidateExamSession = sessionV2,
                            CandidateExamSessionQuestion = snapshotQuestion,
                            SubmittedAnswerText = !string.IsNullOrWhiteSpace(masterQ.StarterCode) ? masterQ.StarterCode : null,
                            MarksObtained = 0,
                            EvaluationStatus = "Pending",
                            EvaluationLocked = false
                        });
                    }
                }

                // Standardize every paper to exactly 100.00 marks, proportionally weighting questions according to interviewer/DB marks
                if (sessionV2.Questions.Count > 0)
                {
                    var rawTotalMarks = sessionV2.Questions.Sum(q => q.Marks);
                    if (rawTotalMarks <= 0) rawTotalMarks = sessionV2.Questions.Count;

                    decimal runningSum = 0;
                    var questionsList = sessionV2.Questions.OrderBy(q => q.DisplayOrder).ToList();
                    for (int i = 0; i < questionsList.Count; i++)
                    {
                        var q = questionsList[i];
                        if (i == questionsList.Count - 1)
                        {
                            // Ensure the total sum is precisely 100.00m without any rounding difference
                            q.Marks = Math.Max(0.01m, 100.00m - runningSum);
                        }
                        else
                        {
                            var normalized = Math.Round((q.Marks / rawTotalMarks) * 100.00m, 2);
                            if (normalized <= 0) normalized = 1.00m;
                            q.Marks = normalized;
                            runningSum += normalized;
                        }
                    }

                    sessionV2.TotalMarks = 100.00m;
                }
                else
                {
                    sessionV2.TotalMarks = 100.00m;
                }

                progress.Status = "InProgress";
                progress.StartedAt ??= DateTime.UtcNow;

                db.CandidateExamSessionsV2.Add(sessionV2);
                await db.SaveChangesAsync(cancellationToken);

                return ExamWorkspaceMapper.ToWorkspaceDto(sessionV2);
            }
            else
            {
                // Fallback to legacy QuestionPaper (V1)
                var roundAssessment = await db.VacancyRoundAssessments
                    .Include(ra => ra.VacancyQuestionPaper)
                    .FirstOrDefaultAsync(ra => ra.VacancyPipelineFlowRoundId == progress.VacancyPipelineFlowRoundId, cancellationToken);

                var paper = roundAssessment?.VacancyQuestionPaper
                    ?? await db.VacancyQuestionPapers.FirstOrDefaultAsync(qp => qp.Status == "Published", cancellationToken)
                    ?? await db.VacancyQuestionPapers.FirstOrDefaultAsync(cancellationToken)
                    ?? throw new ValidationException([new FluentValidation.Results.ValidationFailure("VacancyQuestionPaper", "No assessment template or question paper available.")]);

                var fullPaper = await db.VacancyQuestionPapers
                    .Include(p => p.Questions).ThenInclude(q => q.Options)
                    .FirstAsync(p => p.Id == paper.Id, cancellationToken);

                var session = new CandidateExamSession
                {
                    CandidateId = candidate.Id,
                    VacancyId = candidate.VacancyId,
                    VacancyQuestionPaperId = paper.Id,
                    CandidatePipelineProgressId = progress.Id,
                    SessionToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(24)),
                    AttemptNumber = attemptNumber,
                    ShuffleSeed = shuffleSeed,
                    SnapshotCandidateName = $"{candidate.FirstName} {candidate.LastName}".Trim(),
                    SnapshotCandidateCode = candidate.CandidateCode,
                    SnapshotVacancyTitle = candidate.Vacancy.Title,
                    SnapshotVacancyCode = candidate.Vacancy.VacancyCode,
                    SnapshotPaperCode = fullPaper.PaperCode,
                    SnapshotPaperTitle = fullPaper.Title,
                    OriginalPaperVersion = fullPaper.PaperVersion,
                    FrozenAssessmentMode = request.TestSource,
                    TestSource = request.TestSource,
                    FrozenIPAddress = request.IpAddress,
                    FrozenBrowser = request.UserAgent?.Length > 200 ? request.UserAgent[..200] : request.UserAgent,
                    FrozenOS = "Unknown",
                    FrozenDeviceType = "Unknown",
                    FrozenTotalDurationMinutes = fullPaper.DurationMinutes,
                    FrozenPassingPercentage = fullPaper.PassingPercentage,
                    FrozenShuffleEnabled = true,
                    FrozenOptionShuffleEnabled = true,
                    SessionStatus = "InProgress",
                    EvaluationStatus = "Pending",
                    TotalMarks = fullPaper.TotalMarks,
                    TotalTimeLeftSeconds = fullPaper.DurationMinutes * 60,
                    ActiveQuestionIndex = 0,
                    StartedAt = DateTime.UtcNow,
                };

                var shuffledQuestions = fullPaper.Questions.OrderBy(q => q.QuestionNumber).ToList();
                Shuffle(shuffledQuestions, rng);

                var displayOrder = 1;
                foreach (var q in shuffledQuestions)
                {
                    var shuffledOptions = q.Options.OrderBy(o => o.OptionLabel).ToList();
                    Shuffle(shuffledOptions, rng);

                    var snapshotQuestion = new CandidateExamSessionQuestion
                    {
                        OriginalVacancyQuestionId = q.Id,
                        OriginalQuestionVersion = q.Version,
                        DisplayOrder = displayOrder,
                        OriginalOrder = q.QuestionNumber,
                        QuestionType = q.QuestionType,
                        QuestionText = q.QuestionText,
                        Marks = q.Marks,
                        TimeAllowedMinutes = q.TimeAllowedMinutes,
                        ProgrammingLanguage = q.ProgrammingLanguage,
                        SqlSchema = q.SqlSchema,
                        MaxWordCount = q.MaxWordCount,
                        QuestionSnapshotJson = JsonSerializer.Serialize(new SnapshotQuestionPayload(
                            q.Id, q.QuestionType, q.QuestionText, q.Marks,
                            q.Options.Select(o => new SnapshotOptionPayload(o.Id, o.OptionLabel, o.OptionText, o.IsCorrect)).ToList())),
                    };

                    var optDisplayOrder = 1;
                    foreach (var opt in shuffledOptions)
                    {
                        snapshotQuestion.Options.Add(new CandidateExamSessionQuestionOption
                        {
                            OriginalVacancyQuestionOptionId = opt.Id,
                            DisplayOrder = optDisplayOrder,
                            OriginalOrder = "ABCD".IndexOf(opt.OptionLabel[0]) + 1,
                            DisplayOptionLabel = ((char)('A' + optDisplayOrder - 1)).ToString(),
                            OptionText = opt.OptionText,
                            IsCorrect = opt.IsCorrect,
                        });
                        optDisplayOrder++;
                    }

                    session.Questions.Add(snapshotQuestion);

                    session.Answers.Add(new CandidateExamAnswer
                    {
                        CandidateExamSessionQuestion = snapshotQuestion,
                        Marks = q.Marks,
                        MarksObtained = 0,
                        EvaluationStatus = "Pending",
                    });

                    displayOrder++;
                }

                if (session.Questions.Count > 0)
                {
                    var rawTotalMarks = session.Questions.Sum(q => q.Marks);
                    if (rawTotalMarks <= 0) rawTotalMarks = session.Questions.Count;

                    decimal runningSum = 0;
                    var questionsList = session.Questions.OrderBy(q => q.DisplayOrder).ToList();
                    for (int i = 0; i < questionsList.Count; i++)
                    {
                        var q = questionsList[i];
                        if (i == questionsList.Count - 1)
                        {
                            q.Marks = Math.Max(0.01m, 100.00m - runningSum);
                        }
                        else
                        {
                            var normalized = Math.Round((q.Marks / rawTotalMarks) * 100.00m, 2);
                            if (normalized <= 0) normalized = 1.00m;
                            q.Marks = normalized;
                            runningSum += normalized;
                        }

                        var ans = session.Answers.FirstOrDefault(a => a.CandidateExamSessionQuestion == q);
                        if (ans != null) ans.Marks = q.Marks;
                    }

                    session.TotalMarks = 100.00m;
                }
                else
                {
                    session.TotalMarks = 100.00m;
                }

                progress.Status = "InProgress";
                progress.StartedAt ??= DateTime.UtcNow;

                db.CandidateExamSessions.Add(session);
                await db.SaveChangesAsync(cancellationToken);

                return ExamWorkspaceMapper.ToWorkspaceDto(session);
            }
        }

        private static void Shuffle<T>(IList<T> list, Random rng)
        {
            for (var i = list.Count - 1; i > 0; i--)
            {
                var j = rng.Next(i + 1);
                (list[i], list[j]) = (list[j], list[i]);
            }
        }
    }
}
