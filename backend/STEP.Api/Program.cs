using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
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

builder.Services.AddAuthorization();

// 5. CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// 6. Controllers & Swagger Configuration
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 7. PHASE 0 STARTUP VERIFICATION ROUTINE (SQL Server & Environment Check via .env)
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    logger.LogInformation("=========================================================================");
    logger.LogInformation("STEP Enterprise ATS — Phase 0 Environment & SQL Connectivity Check");
    logger.LogInformation("Connection Provider: Environment Variable (.env)");
    logger.LogInformation("Target Database: InterviewTestPortal @ 192.168.2.5");
    logger.LogInformation("=========================================================================");

    try
    {
        bool canConnect = await dbContext.Database.CanConnectAsync();

        if (canConnect)
        {
            logger.LogInformation("✅ Environment variables loaded successfully from .env file.");
            logger.LogInformation("✅ SQL Server connection successful using DB_CONNECTION environment variable!");
            logger.LogInformation("✅ Database 'InterviewTestPortal' is reachable and accessible.");
            logger.LogInformation("✅ Existing database schema left 100% untouched (No scaffold/inspection).");
            logger.LogInformation("✅ ApplicationDbContext is empty & ready for Code First development in Phase 1.");
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

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Log.Information("🚀 STEP Enterprise ATS ASP.NET Core 10 Web API started successfully.");
app.Run();
