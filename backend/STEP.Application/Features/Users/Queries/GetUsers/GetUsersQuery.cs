using System.Collections.Generic;
using MediatR;
using STEP.Application.Features.Users.Common;

namespace STEP.Application.Features.Users.Queries.GetUsers
{
    public record GetUsersQuery : IRequest<List<UserDto>>;
}
