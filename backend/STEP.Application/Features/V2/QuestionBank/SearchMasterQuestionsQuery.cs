using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Interfaces;

namespace STEP.Application.Features.V2.QuestionBank
{
    public record SearchMasterQuestionsQuery(
        string? Language = null,
        string? SectionType = null,
        string? QuestionType = null,
        string? ExperienceTier = null,
        bool? IsActive = null,
        string? Search = null,
        int PageIndex = 1,
        int PageSize = 20
    ) : IRequest<QuestionBankSearchResultDto>;

    public class SearchMasterQuestionsQueryHandler(IApplicationDbContext db)
        : IRequestHandler<SearchMasterQuestionsQuery, QuestionBankSearchResultDto>
    {
        public async Task<QuestionBankSearchResultDto> Handle(SearchMasterQuestionsQuery request, CancellationToken cancellationToken)
        {
            var query = db.MasterQuestions.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Language))
                query = query.Where(q => q.Language == request.Language.Trim());

            if (!string.IsNullOrWhiteSpace(request.SectionType))
                query = query.Where(q => q.SectionType == request.SectionType.Trim());

            if (!string.IsNullOrWhiteSpace(request.QuestionType))
                query = query.Where(q => q.QuestionType == request.QuestionType.Trim());

            if (!string.IsNullOrWhiteSpace(request.ExperienceTier))
                query = query.Where(q => q.ExperienceTier == request.ExperienceTier.Trim());

            if (request.IsActive.HasValue)
                query = query.Where(q => q.IsActive == request.IsActive.Value);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim();
                query = query.Where(q => q.QuestionText.Contains(search) || q.Code.Contains(search));
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var pageIndex = Math.Max(1, request.PageIndex);
            var pageSize = Math.Max(1, request.PageSize);
            var skip = (pageIndex - 1) * pageSize;

            var items = await query
                .Include(q => q.Options)
                .OrderByDescending(q => q.Id)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var fresherCount = await query.CountAsync(q => q.ExperienceTier == "Fresher", cancellationToken);
            var juniorCount = await query.CountAsync(q => q.ExperienceTier == "Junior", cancellationToken);
            var midCount = await query.CountAsync(q => q.ExperienceTier == "Mid-Level", cancellationToken);
            var seniorCount = await query.CountAsync(q => q.ExperienceTier == "Senior", cancellationToken);
            var leadCount = await query.CountAsync(q => q.ExperienceTier == "Lead", cancellationToken);

            var itemDtos = items.Select(q => new QuestionBankItemDto(
                q.Id,
                q.Code,
                q.Language,
                q.SectionType,
                q.QuestionType,
                q.ExperienceTier,
                q.QuestionText,
                q.Marks,
                q.SqlSchema,
                q.StarterCode,
                q.TestCases,
                q.IsActive,
                q.CreatedAt.DateTime,
                q.UpdatedAt.DateTime,
                q.Options.OrderBy(o => o.DisplayOrder).Select(o => new QuestionBankOptionDto(
                    o.Id,
                    o.OptionLabel,
                    o.OptionText,
                    o.IsCorrect,
                    o.DisplayOrder
                )).ToList()
            )).ToList();

            return new QuestionBankSearchResultDto(
                itemDtos,
                totalCount,
                pageIndex,
                pageSize,
                new QuestionTierDistributionDto(fresherCount, juniorCount, midCount, seniorCount, leadCount)
            );
        }
    }
}
