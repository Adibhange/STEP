using System.Text;
using STEP.Application.Common.Interfaces;
using STEP.Infrastructure.Persistence;
using STEP.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog Configuration
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Database Context (Default to SQL Server or In-Memory fallback for instant execution)
builder.Services.AddDbContext<StepDbContext>(options =>
{
    var connString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (!string.IsNullOrEmpty(connString))
    {
        options.UseSqlServer(connString);
    }
    else
    {
        options.UseInMemoryDatabase("STEP_Enterprise_Db");
    }
});

// Dependency Injection
builder.Services.AddScoped<IJwtProvider, JwtProvider>();

// Authentication & Authorization
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "STEP.Enterprise",
            ValidAudience = "STEP.Users",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("STEP_SUPER_SECRET_SECURITY_KEY_FOR_ENTERPRISE_JWT_TOKEN_100_BITS"))
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Seed Default Enterprise Data & Initialize Database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<StepDbContext>();
    try
    {
        var script = db.Database.GenerateCreateScript();
        System.IO.File.WriteAllText("STEP_Schema.sql", script);
        Log.Information("Generated complete database DDL schema script: STEP_Schema.sql ({Length} bytes)", script.Length);

        var dbCreator = db.Database.GetService<IDatabaseCreator>() as Microsoft.EntityFrameworkCore.Storage.RelationalDatabaseCreator;
        if (dbCreator != null)
        {
            if (!dbCreator.Exists())
            {
                try
                {
                    dbCreator.Create();
                }
                catch (Exception ex)
                {
                    Log.Warning("Database creation on server skipped or restricted: {Message}", ex.Message);
                }
            }
            if (dbCreator.Exists() && !dbCreator.HasTables())
            {
                dbCreator.CreateTables();
            }
        }

        if (db.Database.CanConnect() && !db.Users.Any())
        {
            var adminUser = new STEP.Domain.Entities.Staff.User
            {
                EmployeeCode = "EMP-001",
                FirstName = "Admin",
                LastName = "Director",
                Email = "admin@enterprise.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                PinHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                IsActive = true,
                CreatedBy = 1
            };
            db.Users.Add(adminUser);

            var loc = new STEP.Domain.Entities.Master.Location { City = "Mumbai", State = "Maharashtra", Country = "India", CreatedBy = 1 };
            db.Locations.Add(loc);

            db.SaveChanges();

            var vacancy = new STEP.Domain.Entities.Vacancy.Vacancy
            {
                VacancyCode = "VAC-2026-001",
                Title = "Senior Full Stack Engineer",
                Department = "Engineering",
                LocationId = loc.Id,
                MinExperienceYears = 3.0m,
                MaxExperienceYears = 7.0m,
                OpeningsCount = 5,
                Status = "Published",
                TargetClosureDate = DateTime.UtcNow.AddDays(30),
                CreatedBy = 1
            };
            vacancy.VacancyStages.Add(new STEP.Domain.Entities.Vacancy.VacancyStage { StageOrder = 1, StageName = "Online Assessment", StageType = "Assessment", PassMarkPercentage = 65, IsMandatory = true });
            vacancy.VacancyStages.Add(new STEP.Domain.Entities.Vacancy.VacancyStage { StageOrder = 2, StageName = "Technical Screen", StageType = "Technical", PassMarkPercentage = 70, IsMandatory = true });
            vacancy.VacancyStages.Add(new STEP.Domain.Entities.Vacancy.VacancyStage { StageOrder = 3, StageName = "Director Interview", StageType = "Director", PassMarkPercentage = 80, IsMandatory = true });

            db.Vacancies.Add(vacancy);
            db.SaveChanges();
            Log.Information("Initial enterprise database seed completed successfully.");
        }
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error initializing or seeding database: {Message}", ex.Message);
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
