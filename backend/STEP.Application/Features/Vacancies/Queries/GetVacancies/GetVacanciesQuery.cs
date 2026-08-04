using MediatR;
using STEP.Application.Features.Vacancies.Common;

namespace STEP.Application.Features.Vacancies.Queries.GetVacancies
{
    public record GetVacanciesQuery(int PageIndex, int PageSize, string? Search, string? Status) : IRequest<VacancyListResultDto>;
}
