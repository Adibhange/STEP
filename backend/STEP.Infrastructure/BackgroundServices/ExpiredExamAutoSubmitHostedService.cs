using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Exams.Commands.SubmitExam;

namespace STEP.Infrastructure.BackgroundServices
{
    /// <summary>
    /// Backstop for candidates who never click "Submit" and whose browser/tab is closed or frozen
    /// once their allotted time runs out — the client-side timer's own auto-submit only fires if
    /// the tab is still open and running, and nothing else previously enforced the deadline
    /// server-side. Polls for InProgress sessions past their deadline (plus the same grace period
    /// SaveExamAnswerCommandHandler uses) and force-submits them through the same SubmitExamCommand
    /// path a candidate's own submit button uses, so scoring logic isn't duplicated.
    /// </summary>
    public class ExpiredExamAutoSubmitHostedService(IServiceScopeFactory scopeFactory, ILogger<ExpiredExamAutoSubmitHostedService> logger) : BackgroundService
    {
        private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(30);
        private const int GracePeriodSeconds = 60;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await AutoSubmitExpiredAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Expired exam auto-submit loop failed unexpectedly");
                }

                try
                {
                    await Task.Delay(PollInterval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    // Shutting down.
                }
            }
        }

        private async Task AutoSubmitExpiredAsync(CancellationToken cancellationToken)
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
            var mediator = scope.ServiceProvider.GetRequiredService<ISender>();

            var now = DateTime.UtcNow;

            // FrozenTotalDurationMinutes varies per session, so the deadline isn't a single
            // SQL-translatable comparison — pull the (small) set of InProgress sessions and
            // filter in memory instead.
            var inProgress = await db.CandidateExamSessions
                .Where(s => s.SessionStatus == "InProgress" && s.StartedAt != null)
                .Select(s => new { s.SessionToken, s.StartedAt, s.FrozenTotalDurationMinutes })
                .ToListAsync(cancellationToken);

            var expiredTokens = inProgress
                .Where(s => s.StartedAt!.Value.AddMinutes(s.FrozenTotalDurationMinutes).AddSeconds(GracePeriodSeconds) < now)
                .Select(s => s.SessionToken)
                .ToList();

            foreach (var token in expiredTokens)
            {
                try
                {
                    await mediator.Send(new SubmitExamCommand(token), cancellationToken);
                    logger.LogInformation("[ExamAutoSubmit] Force-submitted expired session {SessionToken}", token);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "[ExamAutoSubmit] Failed to auto-submit expired session {SessionToken}", token);
                }
            }
        }
    }
}
