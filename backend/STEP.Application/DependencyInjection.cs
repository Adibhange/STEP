using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using STEP.Application.Common.Behaviors;
using STEP.Application.Common.Services;

namespace STEP.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            var assembly = Assembly.GetExecutingAssembly();

            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));
            services.AddValidatorsFromAssembly(assembly);
            services.AddAutoMapper(assembly);
            services.AddTransient(typeof(MediatR.IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            services.AddScoped<ICandidateAdvancementService, CandidateAdvancementService>();

            return services;
        }
    }
}
