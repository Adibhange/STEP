using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using STEP.Application.Common.Interfaces;
using STEP.Application.Common.Models;
using STEP.Infrastructure.BackgroundServices;
using STEP.Infrastructure.Documents;
using STEP.Infrastructure.Security;
using STEP.Infrastructure.Services;

namespace STEP.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration? configuration = null)
        {
            if (configuration != null)
            {
                services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));
            }
            else
            {
                services.AddOptions<EmailSettings>();
            }

            services.AddSingleton<IPasswordHasher, PasswordHasher>();
            services.AddSingleton<IJwtTokenService, JwtTokenService>();
            services.AddSingleton<IExcelQuestionImportParser, ExcelQuestionImportParser>();
            services.AddSingleton<IFileStorageService, LocalFileStorageService>();
            services.AddSingleton<IOfferLetterPdfGenerator, QuestPdfOfferLetterGenerator>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IInterviewerNotificationService, InterviewerNotificationService>();
            services.AddHostedService<OutboxDispatcherHostedService>();
            services.AddHostedService<ExpiredExamAutoSubmitHostedService>();

            return services;
        }
    }
}
