using MediatR;
using System.Collections.Generic;

namespace STEP.Application.Features.V2.Vacancies.Queries.GetRoleHiringProfiles
{
    public record GetRoleHiringProfilesQuery(int MasterRoleId) : IRequest<List<RoleHiringProfileDto>>;
}
