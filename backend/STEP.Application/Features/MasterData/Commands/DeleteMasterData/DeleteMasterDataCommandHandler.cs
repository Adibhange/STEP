using System.Threading;
using System.Threading.Tasks;
using MediatR;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Master;

namespace STEP.Application.Features.MasterData.Commands.DeleteMasterData
{
    public class DeleteMasterDataCommandHandler(IApplicationDbContext db)
        : IRequestHandler<DeleteMasterDataCommand, bool>
    {
        public async Task<bool> Handle(DeleteMasterDataCommand request, CancellationToken cancellationToken)
        {
            MasterDataEntity? entity = request.Category.ToLowerInvariant() switch
            {
                "roles" => await db.MasterRoles.FindAsync(new object[] { request.Id }, cancellationToken),
                "departments" => await db.MasterDepartments.FindAsync(new object[] { request.Id }, cancellationToken),
                "hiringlocations" => await db.MasterHiringLocations.FindAsync(new object[] { request.Id }, cancellationToken),
                "employmenttypes" => await db.MasterEmploymentTypes.FindAsync(new object[] { request.Id }, cancellationToken),
                "experiencelevels" or "experiences" => await db.MasterExperienceLevels.FindAsync(new object[] { request.Id }, cancellationToken),
                _ => throw new NotFoundException("MasterDataCategory", request.Category)
            };

            if (entity is null)
                throw new NotFoundException("MasterDataEntity", request.Id);

            entity.IsDeleted = true;

            await db.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
