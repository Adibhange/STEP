using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Master;
using STEP.Domain.Entities.QR;
using STEP.Domain.Entities.Vacancy;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;

namespace STEP.Application.Features.V2.Vacancies.Commands.CreateInstantDrive
{
    public class CreateInstantDriveCommandHandler(IApplicationDbContext db, IConfiguration configuration)
        : IRequestHandler<CreateInstantDriveCommand, InstantDriveResultDto>
    {
        public async Task<InstantDriveResultDto> Handle(CreateInstantDriveCommand request, CancellationToken cancellationToken)
        {
            // 1. Resolve MasterRole
            var masterRole = await db.MasterRoles
                .Include(r => r.HiringProfiles)
                .FirstOrDefaultAsync(r => r.Id == request.MasterRoleId, cancellationToken)
                ?? throw new NotFoundException(nameof(MasterRole), request.MasterRoleId);

            // 2. Resolve RoleHiringProfile
            RoleHiringProfile? profile = null;
            if (request.RoleHiringProfileId.HasValue)
            {
                profile = await db.RoleHiringProfiles
                    .Include(p => p.ExperienceLevel)
                    .FirstOrDefaultAsync(p => p.Id == request.RoleHiringProfileId.Value && p.MasterRoleId == masterRole.Id, cancellationToken);
            }

            profile ??= masterRole.HiringProfiles.FirstOrDefault(p => p.IsDefault && p.IsActive)
                     ?? masterRole.HiringProfiles.FirstOrDefault(p => p.IsActive);

            var profileName = profile?.ProfileName ?? "Standard Direct Hiring Profile";
            var minExp = profile?.MinExperienceYears ?? 0.0m;
            var maxExp = profile?.MaxExperienceYears ?? 3.0m;
            var passingCutoff = profile?.PassingPercentage ?? 70.00m;

            // 3. Resolve Master Taxonomies with Fallbacks
            var department = request.DepartmentId.HasValue
                ? await db.MasterDepartments.FirstOrDefaultAsync(d => d.Id == request.DepartmentId.Value, cancellationToken)
                : await db.MasterDepartments.FirstOrDefaultAsync(cancellationToken);
            department ??= await db.MasterDepartments.FirstAsync(cancellationToken);

            var hiringLocation = request.HiringLocationId.HasValue
                ? await db.MasterHiringLocations.FirstOrDefaultAsync(l => l.Id == request.HiringLocationId.Value, cancellationToken)
                : await db.MasterHiringLocations.FirstOrDefaultAsync(cancellationToken);
            hiringLocation ??= await db.MasterHiringLocations.FirstAsync(cancellationToken);

            var employmentType = request.EmploymentTypeId.HasValue
                ? await db.MasterEmploymentTypes.FirstOrDefaultAsync(e => e.Id == request.EmploymentTypeId.Value, cancellationToken)
                : await db.MasterEmploymentTypes.FirstOrDefaultAsync(cancellationToken);
            employmentType ??= await db.MasterEmploymentTypes.FirstAsync(cancellationToken);

            var testLocation = request.TestLocationId.HasValue
                ? await db.MasterTestLocations.FirstOrDefaultAsync(t => t.Id == request.TestLocationId.Value, cancellationToken)
                : await db.MasterTestLocations.FirstOrDefaultAsync(cancellationToken);
            testLocation ??= await db.MasterTestLocations.FirstAsync(cancellationToken);

            // 4. Generate Vacancy Code & Title
            var sequence = await db.Vacancies.IgnoreQueryFilters().CountAsync(cancellationToken) + 101;
            var vacancyCode = $"VAC-{DateTime.UtcNow:yyyy}-{sequence}";
            var driveTitle = $"{masterRole.Name} ({profileName}) - ⚡ 1-Click Drive";

            var vacancy = new VacancyEntity
            {
                VacancyCode = vacancyCode,
                Title = driveTitle,
                MasterRoleId = masterRole.Id,
                DepartmentId = department.Id,
                HiringLocationId = hiringLocation.Id,
                EmploymentTypeId = employmentType.Id,
                DriveType = "Walk-in Drive",
                WorkMode = "On-site",
                Status = "Active",
                TotalOpenings = request.TotalOpenings > 0 ? request.TotalOpenings : 5,
                MinExperienceYears = minExp,
                MaxExperienceYears = maxExp,
                JobDescription = $"Automated recruitment drive for {masterRole.Name} - {profileName}.",
                ClosingDate = DateTime.UtcNow.AddDays(30),
                WalkinDriveDate = request.WalkinDriveDate ?? DateTime.UtcNow.Date,
                WalkinStartTime = request.WalkinStartTime ?? new TimeSpan(9, 30, 0),
                WalkinEndTime = request.WalkinEndTime ?? new TimeSpan(18, 0, 0),
            };

            vacancy.TestLocations.Add(new VacancyTestLocation { MasterTestLocationId = testLocation.Id });

            // 5. Clone or Create Published Question Paper
            VacancyQuestionPaper paper;
            if (profile?.QuestionPaperTemplateId.HasValue == true)
            {
                var templatePaper = await db.VacancyQuestionPapers
                    .Include(p => p.Questions)
                        .ThenInclude(q => q.Options)
                    .FirstOrDefaultAsync(p => p.Id == profile.QuestionPaperTemplateId.Value, cancellationToken);

                if (templatePaper != null)
                {
                    paper = new VacancyQuestionPaper
                    {
                        PaperCode = $"QP-{DateTime.UtcNow:yyyy}-{sequence}",
                        Title = $"{templatePaper.Title} (Cloned)",
                        PaperVersion = 1,
                        TotalQuestions = templatePaper.TotalQuestions,
                        TotalMarks = templatePaper.TotalMarks,
                        DurationMinutes = templatePaper.DurationMinutes > 0 ? templatePaper.DurationMinutes : 45,
                        PassingPercentage = passingCutoff,
                        Status = "Published",
                        PublishedAt = DateTime.UtcNow,
                    };

                    foreach (var q in templatePaper.Questions.OrderBy(q => q.QuestionNumber))
                    {
                        var clonedQ = new VacancyQuestion
                        {
                            QuestionNumber = q.QuestionNumber,
                            QuestionType = q.QuestionType,
                            QuestionText = q.QuestionText,
                            Marks = q.Marks,
                            TimeAllowedMinutes = q.TimeAllowedMinutes,
                            ProgrammingLanguage = q.ProgrammingLanguage,
                            SqlSchema = q.SqlSchema,
                            MaxWordCount = q.MaxWordCount,
                        };
                        foreach (var opt in q.Options)
                        {
                            clonedQ.Options.Add(new VacancyQuestionOption
                            {
                                OptionLabel = opt.OptionLabel,
                                OptionText = opt.OptionText,
                                IsCorrect = opt.IsCorrect,
                            });
                        }
                        paper.Questions.Add(clonedQ);
                    }
                }
                else
                {
                    paper = GenerateDefaultAssessmentPaper(sequence, masterRole.Name, profileName, passingCutoff);
                }
            }
            else
            {
                paper = GenerateDefaultAssessmentPaper(sequence, masterRole.Name, profileName, passingCutoff);
            }

            vacancy.QuestionPapers.Add(paper);

            // 6. Build Multi-Round Autonomous Pipeline Flow
            var flow = new VacancyPipelineFlow
            {
                VersionName = "Autonomous Flow v1",
                Description = "Standard 3-stage automated recruitment flow",
                IsDefault = true,
            };

            var round1 = new VacancyPipelineFlowRound
            {
                RoundOrder = 1,
                Name = "Round 1: Aptitude & Technical Assessment",
                RoundType = "Assessment",
                CutoffPercent = passingCutoff,
            };
            round1.RoundAssessments.Add(new VacancyRoundAssessment
            {
                VacancyQuestionPaper = paper,
            });

            var round2 = new VacancyPipelineFlowRound
            {
                RoundOrder = 2,
                Name = "Round 2: Technical Interview",
                RoundType = "Interview",
                CutoffPercent = 70.00m,
            };

            var round3 = new VacancyPipelineFlowRound
            {
                RoundOrder = 3,
                Name = "Round 3: Director Final Round",
                RoundType = "Director",
                CutoffPercent = 70.00m,
            };

            flow.Rounds.Add(round1);
            flow.Rounds.Add(round2);
            flow.Rounds.Add(round3);
            vacancy.PipelineFlows.Add(flow);

            db.Vacancies.Add(vacancy);
            await db.SaveChangesAsync(cancellationToken);

            // 7. Generate Live QR Code and Public V2 Apply URL
            var frontendUrlRaw = configuration["FRONTEND_URL"] ?? "http://localhost:3000";
            var frontendUrl = frontendUrlRaw.TrimEnd('/');
            var qrCodeString = $"WD-{Convert.ToHexString(RandomNumberGenerator.GetBytes(4))}";
            var registrationUrl = $"{frontendUrl}/apply/v2/{qrCodeString}";

            var qrCode = new QRCode
            {
                VacancyId = vacancy.Id,
                Code = qrCodeString,
                RegistrationUrl = registrationUrl,
                VenueName = testLocation.Name,
                VenueAddress = testLocation.Description,
                DriveDate = vacancy.WalkinDriveDate ?? DateTime.UtcNow.Date,
                DriveStartTime = vacancy.WalkinStartTime,
                DriveEndTime = vacancy.WalkinEndTime,
                Capacity = 200,
                RegistrationDeadline = vacancy.ClosingDate,
                Status = "Active",
            };

            db.QRCodes.Add(qrCode);
            await db.SaveChangesAsync(cancellationToken);

            return new InstantDriveResultDto(
                vacancy.Id,
                vacancy.VacancyCode,
                vacancy.Title,
                profileName,
                department.Name,
                hiringLocation.Name,
                vacancy.TotalOpenings,
                vacancy.MinExperienceYears,
                vacancy.MaxExperienceYears,
                paper.PassingPercentage,
                paper.Title,
                paper.TotalQuestions,
                paper.DurationMinutes,
                qrCode.Id,
                qrCode.Code,
                qrCode.RegistrationUrl,
                $"/api/v2/qrcodes/vacancy/{vacancy.Id}"
            );
        }

        private static VacancyQuestionPaper GenerateDefaultAssessmentPaper(
            int sequence, string roleName, string profileName, decimal passingCutoff)
        {
            var paper = new VacancyQuestionPaper
            {
                PaperCode = $"QP-AUT-{DateTime.UtcNow:yyyy}-{sequence}",
                Title = $"{roleName} ({profileName}) Assessment Paper",
                PaperVersion = 1,
                TotalQuestions = 10,
                TotalMarks = 20,
                DurationMinutes = 30,
                PassingPercentage = passingCutoff,
                Status = "Published",
                PublishedAt = DateTime.UtcNow,
            };

            var questionsData = new[]
            {
                ("What is the primary advantage of component-based UI architecture?", "Single Choice", new[] { ("Reusability and maintainability", true), ("Direct database access", false), ("Elimination of CSS", false), ("Bypassing HTTP protocols", false) }),
                ("Which of the following is an asynchronous operation in modern web applications?", "Single Choice", new[] { ("HTTP Fetch Request", true), ("Variable declaration", false), ("Integer addition", false), ("Array length check", false) }),
                ("What does REST stand for in API design?", "Single Choice", new[] { ("Representational State Transfer", true), ("Realtime Execution Standard Target", false), ("Remote Enterprise Software Table", false), ("Relational Entity State Transaction", false) }),
                ("Which data structure operates on a First-In-First-Out (FIFO) principle?", "Single Choice", new[] { ("Queue", true), ("Stack", false), ("Binary Search Tree", false), ("Heap", false) }),
                ("What is the main purpose of an indexing mechanism in relational databases?", "Single Choice", new[] { ("Speed up data retrieval", true), ("Encrypt table storage", false), ("Enforce HTML escaping", false), ("Compress server memory", false) }),
                ("In Git, which command creates and switches to a new branch simultaneously?", "Single Choice", new[] { ("git checkout -b <branch>", true), ("git merge --new", false), ("git push -u origin", false), ("git commit -m", false) }),
                ("What does HTTP status code 401 indicate?", "Single Choice", new[] { ("Unauthorized / Authentication Required", true), ("Page Not Found", false), ("Internal Server Error", false), ("Redirect Permanently", false) }),
                ("Which principle states that software entities should be open for extension, but closed for modification?", "Single Choice", new[] { ("Open-Closed Principle (OCP)", true), ("Single Responsibility Principle", false), ("Liskov Substitution Principle", false), ("Dependency Inversion Principle", false) }),
                ("What is the purpose of CORS (Cross-Origin Resource Sharing)?", "Single Choice", new[] { ("Control resource access from different origins in browsers", true), ("Accelerate database transactions", false), ("Compile TypeScript to C#", false), ("Manage CSS grid layouts", false) }),
                ("In SQL, which clause is used to filter records after aggregate functions (e.g. COUNT, SUM)?", "Single Choice", new[] { ("HAVING", true), ("WHERE", false), ("GROUP BY", false), ("ORDER BY", false) }),
            };

            int qNum = 1;
            foreach (var item in questionsData)
            {
                var q = new VacancyQuestion
                {
                    QuestionNumber = qNum++,
                    QuestionType = "SINGLE_CHOICE",
                    QuestionText = item.Item1,
                    Marks = 2,
                    TimeAllowedMinutes = 3,
                };
                char optChar = 'A';
                foreach (var opt in item.Item3)
                {
                    q.Options.Add(new VacancyQuestionOption
                    {
                        OptionLabel = optChar.ToString(),
                        OptionText = opt.Item1,
                        IsCorrect = opt.Item2,
                    });
                    optChar++;
                }
                paper.Questions.Add(q);
            }

            return paper;
        }
    }
}
