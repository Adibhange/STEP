using Microsoft.Extensions.DependencyInjection;
using STEP.Application.Common.Interfaces;
using STEP.Infrastructure.BackgroundServices;
using STEP.Infrastructure.Documents;
using STEP.Infrastructure.Security;

namespace STEP.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            services.AddSingleton<IPasswordHasher, PasswordHasher>();
            services.AddSingleton<IJwtTokenService, JwtTokenService>();
            services.AddSingleton<IExcelQuestionImportParser, ExcelQuestionImportParser>();
            services.AddSingleton<IFileStorageService, LocalFileStorageService>();
            services.AddSingleton<IOfferLetterPdfGenerator, QuestPdfOfferLetterGenerator>();
            services.AddHostedService<OutboxDispatcherHostedService>();
            services.AddHostedService<ExpiredExamAutoSubmitHostedService>();

            return services;
        }
    }
}
