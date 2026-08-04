using MediatR;
using STEP.Application.Features.Candidates.Common;

namespace STEP.Application.Features.Candidates.Queries.GetCandidates
{
    public record GetCandidatesQuery(int PageIndex, int PageSize, string? Search, string? Status, int? VacancyId) : IRequest<CandidateListResultDto>;
}
