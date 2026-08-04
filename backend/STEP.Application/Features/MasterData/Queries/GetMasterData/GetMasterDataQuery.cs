using System.Collections.Generic;
using MediatR;
using STEP.Application.Features.MasterData.Common;

namespace STEP.Application.Features.MasterData.Queries.GetMasterData
{
    /// <summary>
    /// Category is one of the five Phase 1 taxonomies the frontend Settings screen renders:
    /// "roles", "departments", "hiringLocations", "testLocations", "employmentTypes".
    /// </summary>
    public record GetMasterDataQuery(string Category) : IRequest<List<MasterDataItemDto>>;
}
