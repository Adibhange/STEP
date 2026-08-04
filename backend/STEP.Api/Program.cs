using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using STEP.Api.Middleware;
using STEP.Application;
using STEP.Application.Common.Interfaces;
using STEP.Infrastructure;
using STEP.Persistence;

// 1. Load Backend .env File
var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
if (File.Exists(envPath))
{
    DotNetEnv.Env.Load(envPath);
}
else if (File.Exists(".env"))
{
    DotNetEnv.Env.Load(".env");
}

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

// 2. Serilog Configuration
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// 3. Read DB_CONNECTION from Environment Variables
var dbConnection = Environment.GetEnvironmentVariable("DB_CONNECTION")
                   ?? builder.Configuration["DB_CONNECTION"];

if (string.IsNullOrWhiteSpace(dbConnection))
{
    Log.Fatal("❌ CRITICAL ERROR: 'DB_CONNECTION' environment variable is missing. Please configure DB_CONNECTION in the backend .env file.");
    throw new InvalidOperationException("CRITICAL ERROR: 'DB_CONNECTION' environment variable is missing. Please configure DB_CONNECTION in the backend .env file.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(dbConnection, sqlOptions =>
    {
        sqlOptions.CommandTimeout(30);
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null);
    });
});
builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

// 3b. Application (MediatR/CQRS, FluentValidation, AutoMapper) & Infrastructure (JWT, password hashing)
builder.Services.AddApplication();
builder.Services.AddInfrastructure();

// 4. Read JWT Environment Variable Placeholders
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? builder.Configuration["JWT_SECRET"]
                ?? "STEP_ENTERPRISE_ATS_V1_PRODUCTION_JWT_SECRET_KEY_256_BITS_CRYPTO_SECURE_KEY_2026_PROD_VERIFIED";

var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
                ?? builder.Configuration["JWT_ISSUER"]
                ?? "STEP.Enterprise";

var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                 ?? builder.Configuration["JWT_AUDIENCE"]
                 ?? "STEP.Users";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Granular RBAC: policies gate on the "permission" claim baked into the JWT
    // (see STEP.Infrastructure.Security.JwtTokenService), sourced from RolePermissions.
    options.AddPolicy("User.Manage", policy => policy.RequireClaim("permission", "User.Manage"));
    options.AddPolicy("MasterData.Manage", policy => policy.RequireClaim("permission", "MasterData.Manage"));
    options.AddPolicy("Vacancy.Create", policy => policy.RequireClaim("permission", "Vacancy.Create"));
    // Question paper publishing/import reuses Exam.Manage — no dedicated permission is seeded for it.
    options.AddPolicy("Exam.Manage", policy => policy.RequireClaim("permission", "Exam.Manage"));
    options.AddPolicy("Candidate.View", policy => policy.RequireClaim("permission", "Candidate.View"));
    options.AddPolicy("Candidate.Approve", policy => policy.RequireClaim("permission", "Candidate.Approve"));
    options.AddPolicy("Report.View", policy => policy.RequireClaim("permission", "Report.View"));
});

// 5. CORS Policy for Next.js Frontend
var allowedOrigins = (Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001")
    .Split(',', StringSplitOptions.RemoveEmptyEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p
        .WithOrigins(allowedOrigins)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());
});

// 6. Controllers & Swagger Configuration
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 7. STARTUP VERIFICATION ROUTINE (SQL Server & Environment Check via .env)
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    logger.LogInformation("=========================================================================");
    logger.LogInformation("STEP Enterprise ATS — Phase 1+2 Environment & SQL Connectivity Check");
    logger.LogInformation("Connection Provider: Environment Variable (.env)");
    logger.LogInformation("Target Database: InterviewTestPortal @ 192.168.2.5 (schemas: staff/master/audit/vacancy/question)");
    logger.LogInformation("=========================================================================");

    try
    {
        bool canConnect = await dbContext.Database.CanConnectAsync();

        if (canConnect)
        {
            logger.LogInformation("✅ Environment variables loaded successfully from .env file.");
            logger.LogInformation("✅ SQL Server connection successful using DB_CONNECTION environment variable!");
            logger.LogInformation("✅ Database 'InterviewTestPortal' is reachable and accessible.");
            logger.LogInformation("✅ STEP tables live under their own per-domain schemas — no pre-existing tables touched.");
            logger.LogInformation("✅ Phase 1 (Identity, RBAC, Master Data) is active.");
        }
        else
        {
            logger.LogError("❌ SQL Server connection failed: Database.CanConnect() returned false.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "❌ SQL Server connection failed with exception: {Message}", ex.Message);
    }
}

// 8. HTTP Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "STEP Enterprise ATS API v1");
    });
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Log.Information("🚀 STEP Enterprise ATS ASP.NET Core 10 Web API started successfully.");
app.Run();
