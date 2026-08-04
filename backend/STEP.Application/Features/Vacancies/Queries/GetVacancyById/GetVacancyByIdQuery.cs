using MediatR;
using STEP.Application.Features.Vacancies.Common;

namespace STEP.Application.Features.Vacancies.Queries.GetVacancyById
{
    public record GetVacancyByIdQuery(int Id) : IRequest<VacancyDto>;
}
