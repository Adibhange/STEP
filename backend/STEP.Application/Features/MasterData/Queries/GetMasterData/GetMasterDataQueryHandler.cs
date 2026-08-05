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
        public async Task<List<MasterDataItemDto>> Handle(GetMasterDataQuery request, CancellationToken cancellationToken)
        {
            IQueryable<MasterDataEntity> query = request.Category.ToLowerInvariant() switch
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
