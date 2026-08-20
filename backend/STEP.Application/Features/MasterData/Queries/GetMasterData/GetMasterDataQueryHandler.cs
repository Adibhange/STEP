using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.MasterData.Common;
using STEP.Domain.Entities.Master;

namespace STEP.Application.Features.MasterData.Queries.GetMasterData
{
    public class GetMasterDataQueryHandler(IApplicationDbContext db) : IRequestHandler<GetMasterDataQuery, List<MasterDataItemDto>>
    {
        private static readonly List<MasterDataItemDto> DefaultLanguages =
        [
            new("1", "C# (.NET)", "LANG-CS", "C# .NET Core compilation runtime", "Active", DateTime.UtcNow.ToString("yyyy-MM-dd")),
            new("2", "JavaScript / React", "LANG-JS", "Node.js & React frontend runtime", "Active", DateTime.UtcNow.ToString("yyyy-MM-dd")),
            new("3", "TypeScript", "LANG-TS", "TypeScript typed compiler environment", "Active", DateTime.UtcNow.ToString("yyyy-MM-dd")),
            new("4", "SQL (Database)", "LANG-SQL", "Relational SQL database sandbox", "Active", DateTime.UtcNow.ToString("yyyy-MM-dd")),
            new("5", "Python", "LANG-PY", "Python 3 runtime & data structures", "Active", DateTime.UtcNow.ToString("yyyy-MM-dd")),
            new("6", "Java", "LANG-JAVA", "Java OpenJDK execution environment", "Active", DateTime.UtcNow.ToString("yyyy-MM-dd")),
            new("7", "General Aptitude", "LANG-APT", "Quantitative, logical & verbal reasoning", "Active", DateTime.UtcNow.ToString("yyyy-MM-dd")),
        ];

        public async Task<List<MasterDataItemDto>> Handle(GetMasterDataQuery request, CancellationToken cancellationToken)
        {
            var category = request.Category.ToLowerInvariant().Trim();

            if (category is "languages" or "programminglanguages")
            {
                // Attempt to get active languages from question bank, union with default master languages
                var distinctLangs = await db.MasterQuestions
                    .Where(q => q.IsActive && !string.IsNullOrEmpty(q.Language))
                    .Select(q => q.Language)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                if (distinctLangs.Count > 0)
                {
                    var result = new List<MasterDataItemDto>();
                    int idx = 1;
                    foreach (var lang in distinctLangs)
                    {
                        var def = DefaultLanguages.FirstOrDefault(d => string.Equals(d.Name, lang, StringComparison.OrdinalIgnoreCase));
                        var safeCode = lang.ToUpperInvariant().Replace(" ", "").Replace("#", "SHARP");
                        result.Add(new MasterDataItemDto(
                            idx.ToString(),
                            lang,
                            def?.Code ?? $"LANG-{(safeCode.Length > 6 ? safeCode.Substring(0, 6) : safeCode)}",
                            def?.Description ?? $"{lang} assessment language domain",
                            "Active",
                            DateTime.UtcNow.ToString("yyyy-MM-dd")
                        ));
                        idx++;
                    }
                    return result;
                }

                return DefaultLanguages;
            }

            if (category is "hiringprofiles" or "assessmenttemplates" or "blueprints")
            {
                var blueprints = await db.AssessmentBlueprints.Where(b => b.IsActive).ToListAsync(cancellationToken);
                return blueprints.Select(b => new MasterDataItemDto(
                    b.Id.ToString(),
                    b.Name,
                    b.Code,
                    $"{b.TotalQuestions} Qs • Pass: {b.DefaultPassingPercentage}% • {b.TotalDurationMinutes}m",
                    b.IsActive ? "Active" : "Inactive",
                    b.UpdatedAt.ToString("yyyy-MM-dd")
                )).ToList();
            }

            if (category is "questionbank")
            {
                return [];
            }

            IQueryable<MasterDataEntity> query = category switch
            {
                "roles" => db.MasterRoles,
                "departments" => db.MasterDepartments,
                "hiringlocations" => db.MasterHiringLocations,
                "testlocations" => db.MasterTestLocations,
                "employmenttypes" => db.MasterEmploymentTypes,
                "experiencelevels" or "experiences" => db.MasterExperienceLevels,
                _ => throw new NotFoundException("MasterDataCategory", request.Category)
            };

            var rows = await query.OrderBy(m => m.Name).ToListAsync(cancellationToken);

            return rows.Select(m => new MasterDataItemDto(
                m.Id.ToString(),
                m.Name,
                m.Code,
                m.Description,
                m.IsActive ? "Active" : "Inactive",
                (m.ModifiedAt ?? m.CreatedAt).ToString("yyyy-MM-dd"))).ToList();
        }
    }
}
