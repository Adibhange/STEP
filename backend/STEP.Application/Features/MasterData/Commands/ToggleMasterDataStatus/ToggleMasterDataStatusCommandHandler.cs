using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Master;

namespace STEP.Application.Features.MasterData.Commands.ToggleMasterDataStatus
{
    public class ToggleMasterDataStatusCommandHandler(IApplicationDbContext db)
        : IRequestHandler<ToggleMasterDataStatusCommand, bool>
    {
        public async Task<bool> Handle(ToggleMasterDataStatusCommand request, CancellationToken cancellationToken)
        {
            MasterDataEntity? entity = request.Category.ToLowerInvariant() switch
            {
                "roles" => await db.MasterRoles.FindAsync(new object[] { request.Id }, cancellationToken),
                "departments" => await db.MasterDepartments.FindAsync(new object[] { request.Id }, cancellationToken),
                "hiringlocations" => await db.MasterHiringLocations.FindAsync(new object[] { request.Id }, cancellationToken),
                "testlocations" => await db.MasterTestLocations.FindAsync(new object[] { request.Id }, cancellationToken),
                "employmenttypes" => await db.MasterEmploymentTypes.FindAsync(new object[] { request.Id }, cancellationToken),
                "experiencelevels" => await db.MasterExperienceLevels.FindAsync(new object[] { request.Id }, cancellationToken),
                _ => throw new NotFoundException("MasterDataCategory", request.Category)
            };

            if (entity is null)
                throw new NotFoundException("MasterDataEntity", request.Id);

            entity.IsActive = !entity.IsActive;

            await db.SaveChangesAsync(cancellationToken);

            return entity.IsActive;
        }
    }
}
