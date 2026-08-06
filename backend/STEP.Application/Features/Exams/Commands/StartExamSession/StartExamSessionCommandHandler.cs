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
            var candidate = await db.Candidates
                .Include(c => c.Vacancy)
                .Include(c => c.CurrentPipelineProgress)
                .FirstOrDefaultAsync(c => c.CandidateCode == request.CandidateCode, cancellationToken)
                ?? throw new AuthenticationFailedException("Invalid candidate code or passcode.");

            if (candidate.ExamPasscodeHash == null || !hasher.Verify(request.Passcode, candidate.ExamPasscodeHash))
            {
                throw new AuthenticationFailedException("Invalid candidate code or passcode.");
            }

            var progress = candidate.CurrentPipelineProgress;
            if (progress == null || progress.RoundType != "Assessment" || progress.Status is not ("Assigned" or "InProgress"))
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("CurrentPipelineProgress",
                    "There is no active assessment round for this candidate right now.")]);
            }

            var roundAssessment = await db.VacancyRoundAssessments
                .Include(ra => ra.VacancyQuestionPaper)
                .FirstOrDefaultAsync(ra => ra.VacancyPipelineFlowRoundId == progress.VacancyPipelineFlowRoundId, cancellationToken);

            if (roundAssessment?.VacancyQuestionPaper == null || roundAssessment.VacancyQuestionPaper.Status != "Published")
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("VacancyQuestionPaper",
                    "No published question paper has been assigned to this assessment round yet.")]);
            }

            var paper = roundAssessment.VacancyQuestionPaper;

            // Defense-in-depth: AssignPipelineFlowCommandHandler and AssignQuestionPaperToRoundCommandHandler
            // each independently enforce that a round's paper belongs to the same vacancy as the candidate at
            // write time, so this should never trip in practice — but nothing re-checks it at session-start
            // time, so a bug in either of those write paths (or a future raw-SQL/seed/bulk-import mistake)
            // would otherwise go undetected here and silently serve a candidate a different vacancy's paper.
            if (paper.VacancyId != candidate.VacancyId)
            {
                throw new ValidationException([new FluentValidation.Results.ValidationFailure("VacancyQuestionPaper",
                    "This assessment round's question paper does not belong to the candidate's vacancy.")]);
            }

            // Resume-on-reconnect: an existing not-yet-finished session for this round is returned as-is, never re-snapshotted.
            // (Deliberately written as explicit ORs, not `new[] {...}.Contains(...)` — that form
            // trips a LINQ-expression-interpreter bug under EF Core 10 / .NET 10.)
            var existingSession = await db.CandidateExamSessions
                .Include(s => s.Questions).ThenInclude(q => q.Options)
                .Include(s => s.Answers).ThenInclude(a => a.SelectedOptions)
                .Where(s => s.CandidatePipelineProgressId == progress.Id
                    && (s.SessionStatus == "Created" || s.SessionStatus == "Ready" || s.SessionStatus == "InProgress" || s.SessionStatus == "Paused"))
                .OrderByDescending(s => s.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (existingSession != null)
            {
                return ExamWorkspaceMapper.ToWorkspaceDto(existingSession);
            }

            var attemptNumber = await db.CandidateExamSessions.IgnoreQueryFilters()
                .CountAsync(s => s.CandidatePipelineProgressId == progress.Id, cancellationToken) + 1;

            var fullPaper = await db.VacancyQuestionPapers
                .Include(p => p.Questions).ThenInclude(q => q.Options)
                .FirstAsync(p => p.Id == paper.Id, cancellationToken);

            var shuffleSeed = RandomNumberGenerator.GetInt32(1_000_000, 99_999_999);
            var rng = new Random(shuffleSeed);

            var session = new CandidateExamSession
            {
                CandidateId = candidate.Id,
                VacancyId = candidate.VacancyId,
                VacancyQuestionPaperId = paper.Id,
                CandidatePipelineProgressId = progress.Id,
                SessionToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(24)),
                AttemptNumber = attemptNumber,
                ShuffleSeed = shuffleSeed,
                SnapshotCandidateName = $"{candidate.FirstName} {candidate.LastName}",
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
                FrozenOS = "Unknown", // No user-agent parsing library wired up yet.
                FrozenDeviceType = "Unknown",
                FrozenTotalDurationMinutes = fullPaper.DurationMinutes,
                FrozenPassingPercentage = fullPaper.PassingPercentage,
                // Intentionally fixed, not read from any per-vacancy/paper setting — shuffle is
                // always on for every session by product decision (see the Shuffle(...) calls
                // below, which run unconditionally). These two fields exist purely as an audit
                // record of that fact for this session, not as a live on/off switch.
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
