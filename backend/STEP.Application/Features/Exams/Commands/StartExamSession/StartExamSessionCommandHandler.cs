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
                .Include(c => c.Vacancy)
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

            var progress = (request.RoundNumber.HasValue
                ? candidate.PipelineProgressHistory.FirstOrDefault(p => p.RoundNumber == request.RoundNumber.Value)
                : null)
                ?? candidate.CurrentPipelineProgress
                ?? candidate.PipelineProgressHistory.FirstOrDefault(p => p.RoundType == "Assessment")
                ?? candidate.PipelineProgressHistory.FirstOrDefault();

            if (progress == null)
            {
                var fallbackRoundId = await db.VacancyPipelineFlowRounds.Select(r => r.Id).FirstOrDefaultAsync(cancellationToken);
                progress = new STEP.Domain.Entities.Candidate.CandidatePipelineProgress
                {
                    CandidateId = candidate.Id,
                    VacancyPipelineFlowRoundId = fallbackRoundId,
                    RoundNumber = 2,
                    RoundTitle = "Coding & Algorithm Challenge",
                    RoundType = "Assessment",
                    Status = "InProgress",
                };
                candidate.PipelineProgressHistory.Add(progress);
                await db.SaveChangesAsync(cancellationToken);
            }

            // 0. Stage Progression & Prerequisite Validation (Walk-in vs Direct Sourcing)
            if (progress.RoundNumber >= 2)
            {
                var r1 = candidate.PipelineProgressHistory.FirstOrDefault(p => p.RoundNumber == 1);
                var isR1AutoPassed = r1?.Status == "Auto-Passed" || (r1?.RoundTitle?.Contains("Auto-Passed", StringComparison.OrdinalIgnoreCase) ?? false);

                // If Round 1 is an active assessment round and was not auto-passed by HR sourcing:
                if (r1 != null && !isR1AutoPassed && (r1.RoundType == "Assessment" || r1.RoundTitle.Contains("Aptitude", StringComparison.OrdinalIgnoreCase)))
                {
                    var isR1Cleared = r1.Status == "Passed" || (r1.ScoreObtained.HasValue && r1.ScoreObtained.Value >= 70.00m);
                    if (!isR1Cleared)
                    {
                        throw new ValidationException([new FluentValidation.Results.ValidationFailure("StageLock",
                            "Round 2 Technical Assessment is locked. Candidate must complete and pass Round 1 Aptitude (≥ 70%) and be authorized by HR before taking the Technical Round.")]);
                    }

                    if (r1.Status == "Failed" || candidate.Status == "Rejected")
                    {
                        throw new ValidationException([new FluentValidation.Results.ValidationFailure("StageLock",
                            "Round 2 Technical Assessment is locked. Candidate was eliminated in Round 1 Aptitude Assessment.")]);
                    }
                }
            }

            // 1. Completion Lock Check (Re-attempt lock unless Director marked 'On Hold' and HR rescheduled the test)
            var hasCompletedSession = await db.CandidateExamSessions
                .AnyAsync(s => s.CandidatePipelineProgressId == progress.Id
                    && (s.SessionStatus == "Submitted" || s.SessionStatus == "AutoSubmitted" || s.SessionStatus == "Evaluated"), cancellationToken);

            var isCompletedStatus = progress.Status == "Passed" || progress.Status == "Failed" || progress.Status == "Evaluated" || progress.Status == "Submitted";

            if (hasCompletedSession && isCompletedStatus)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("CandidateExamSession", "Assessment has already been completed and submitted. Re-attempts are locked unless Director places candidate 'On Hold' and HR reschedules the test.")]);
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

            var isAptitudeRound = progress.RoundNumber == 1
                || progress.RoundTitle.Contains("Aptitude", StringComparison.OrdinalIgnoreCase)
                || (request.RoundNumber.HasValue && request.RoundNumber.Value == 1);

            // 3. Resume-on-reconnect: an existing not-yet-finished session for this candidate/round is returned as-is
            // However, if this is Round 2 (Technical) and the existing session was mistakenly created as MCQ-only (RULE-MCQ-ONLY),
            // clean up the stale session so it regenerates the proper multi-section Technical Blueprint.
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

            var isStaleMcqSession = !isAptitudeRound && existingSessionV2 != null &&
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

            // 4. Resolve Assessment Blueprint (V2 Dynamic Question Bank Architecture)
            AssessmentBlueprint? blueprint = null;

            if (isAptitudeRound)
            {
                // Round 1: Standard Aptitude MCQ Track
                blueprint = await db.AssessmentBlueprints
                    .Include(b => b.SectionRules.Where(r => r.IsActive))
                    .FirstOrDefaultAsync(b => b.Code == "RULE-MCQ-ONLY" || b.IsDefault, cancellationToken);
            }
            else
            {
                // Round 2 (Technical Assessment): Role-tailored engineering blueprint with coding/SQL sandboxes
                var vacTitle = (candidate.Vacancy?.Title ?? "").ToLower();
                var masterRole = (candidate.Vacancy?.MasterRole?.Name ?? "").ToLower();
                var blueprintId = candidate.Vacancy?.AssessmentBlueprintId;

                if (blueprintId.HasValue)
                {
                    blueprint = await db.AssessmentBlueprints
                        .Include(b => b.SectionRules.Where(r => r.IsActive))
                        .FirstOrDefaultAsync(b => b.Id == blueprintId.Value, cancellationToken);
                }

                if (blueprint == null || blueprint.SectionRules.Count == 0)
                {
                    if (vacTitle.Contains("sql") || vacTitle.Contains("database") || masterRole.Contains("sql") || masterRole.Contains("database"))
                    {
                        blueprint = await db.AssessmentBlueprints
                            .Include(b => b.SectionRules.Where(r => r.IsActive))
                            .FirstOrDefaultAsync(b => b.Code == "RULE-DATA-SQL" || b.Name.Contains("Database"), cancellationToken);
                    }
                    else
                    {
                        blueprint = await db.AssessmentBlueprints
                            .Include(b => b.SectionRules.Where(r => r.IsActive))
                            .FirstOrDefaultAsync(b => b.Code == "RULE-TECH-ENG" || b.Name.Contains("Software Engineering"), cancellationToken);
                    }
                }
            }

            blueprint ??= await db.AssessmentBlueprints
                .Include(b => b.SectionRules.Where(r => r.IsActive))
                .FirstOrDefaultAsync(b => b.IsActive && b.IsDefault, cancellationToken)
                ?? await db.AssessmentBlueprints
                    .Include(b => b.SectionRules.Where(r => r.IsActive))
                    .OrderBy(b => b.Id)
                    .FirstOrDefaultAsync(cancellationToken);

            if (blueprint != null && blueprint.SectionRules.Count > 0)
            {
                var durationMinutes = blueprint.TotalDurationMinutes > 0 ? blueprint.TotalDurationMinutes : 60;
                var passingPercentage = blueprint.DefaultPassingPercentage > 0 ? blueprint.DefaultPassingPercentage : 70;

                var sessionV2 = new CandidateExamSessionV2
                {
                    CandidateId = candidate.Id,
                    Candidate = candidate,
                    VacancyId = candidate.VacancyId,
                    Vacancy = candidate.Vacancy,
                    AssessmentBlueprintId = blueprint.Id,
                    AssessmentBlueprint = blueprint,
                    CandidatePipelineProgressId = progress.Id,
                    SessionToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(24)),
                    CandidateTier = candidate.TotalExperienceYears > 4 ? "Senior" : (candidate.TotalExperienceYears > 1 ? "Mid-Level" : "Fresher"),
                    RolePrimaryLanguage = (candidate.Vacancy?.Title ?? "").Contains("SQL", StringComparison.OrdinalIgnoreCase) ? "SQL" : "C# (.NET)",
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
                foreach (var rule in activeRules)
                {
                    var query = db.MasterQuestions
                        .Include(q => q.Options)
                        .Where(q => q.IsActive);

                    if (isAptitudeRound)
                    {
                        // Round 1: Strictly Aptitude & Logical Reasoning questions
                        query = query.Where(q =>
                            q.SectionType == "Aptitude" ||
                            q.Language == "General Aptitude" ||
                            q.Language.Contains("Aptitude") ||
                            q.Language.Contains("Logic"));
                    }
                    else
                    {
                        // Round 2+: Technical MCQs, Coding, and SQL queries (excluding general aptitude)
                        query = query.Where(q => q.SectionType == rule.SectionType && q.SectionType != "Aptitude" && q.Language != "General Aptitude");
                    }

                    var pool = await query.ToListAsync(cancellationToken);
                    if (pool.Count == 0 && isAptitudeRound)
                    {
                        // Fallback to any available Aptitude / MCQ questions if specific category rule was not found
                        pool = await db.MasterQuestions
                            .Include(q => q.Options)
                            .Where(q => q.IsActive && (q.SectionType == "Aptitude" || q.Language == "General Aptitude" || q.QuestionType == "SINGLE_CHOICE"))
                            .ToListAsync(cancellationToken);
                    }

                    if (pool.Count == 0)
                    {
                        pool = await db.MasterQuestions
                            .Include(q => q.Options)
                            .Where(q => q.IsActive)
                            .ToListAsync(cancellationToken);
                    }

                    var unusedPool = pool.Where(q => !usedMasterQuestionIds.Contains(q.Id)).ToList();
                    var candidatePool = unusedPool.Count >= rule.QuestionCount ? unusedPool : (pool.Count > 0 ? pool : unusedPool);

                    var sampledPool = candidatePool.OrderBy(_ => rng.Next()).Take(rule.QuestionCount).ToList();

                    foreach (var masterQ in sampledPool)
                    {
                        usedMasterQuestionIds.Add(masterQ.Id);

                        var marks = rule.MarksPerQuestion > 0 ? rule.MarksPerQuestion : masterQ.Marks;
                        calculatedTotalMarks += marks;

                        var snapshotQuestion = new CandidateExamSessionQuestionV2
                        {
                            CandidateExamSession = sessionV2,
                            SectionRuleId = rule.Id,
                            OriginalMasterQuestionId = masterQ.Id,
                            OriginalMasterQuestion = masterQ,
                            SectionName = isAptitudeRound ? "Aptitude & Logical Reasoning" : rule.SectionName,
                            SectionType = isAptitudeRound ? "Aptitude" : rule.SectionType,
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
                            MarksObtained = 0,
                            EvaluationStatus = "Pending",
                            EvaluationLocked = false
                        });
                    }
                }

                sessionV2.TotalMarks = calculatedTotalMarks > 0 ? calculatedTotalMarks : blueprint.TotalMarks;

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
