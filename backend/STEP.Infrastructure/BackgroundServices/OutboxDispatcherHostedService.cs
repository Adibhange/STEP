using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using STEP.Application.Common.Interfaces;

namespace STEP.Infrastructure.BackgroundServices
{
    /// <summary>
    /// Polls OutboxMessages for Pending rows and "dispatches" them. There is no real email/SMTP
    /// provider configured yet, so dispatch here means: log what would have been sent, and mark
    /// the row Sent. This still demonstrates the transactional-outbox pattern faithfully — the
    /// event is durably recorded in the same transaction as the business change (see
    /// PublishAssessmentResultCommand, PublishInterviewResultCommand, GenerateOfferLetterCommand,
    /// ApproveOfferCommand) and can never be silently lost even though nothing real is sent yet.
    /// A real Quartz.NET + SMTP/SMS integration can replace just the body of DispatchOneAsync
    /// without touching anything that writes to the outbox.
    /// </summary>
    public class OutboxDispatcherHostedService(IServiceScopeFactory scopeFactory, ILogger<OutboxDispatcherHostedService> logger) : BackgroundService
    {
        private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(15);
        private const int MaxAttempts = 5;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await DispatchPendingAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Outbox dispatch loop failed unexpectedly");
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

        private async Task DispatchPendingAsync(CancellationToken cancellationToken)
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

            var pending = await db.OutboxMessages
                .Where(m => m.Status == "Pending")
                .OrderBy(m => m.Id)
                .Take(20)
                .ToListAsync(cancellationToken);

            foreach (var message in pending)
            {
                try
                {
                    // Simulated dispatch — see class remarks.
                    logger.LogInformation("[Outbox] Dispatching {EventType} (message {Id}): {Payload}",
                        message.EventType, message.Id, message.Payload);

                    message.Status = "Sent";
                    message.ProcessedAt = DateTime.UtcNow;
                }
                catch (Exception ex)
                {
                    message.Attempts++;
                    message.Error = ex.Message;
                    message.Status = message.Attempts >= MaxAttempts ? "Failed" : "Pending";
                }
            }

            if (pending.Count != 0)
            {
                await db.SaveChangesAsync(cancellationToken);
            }
        }
    }
}
