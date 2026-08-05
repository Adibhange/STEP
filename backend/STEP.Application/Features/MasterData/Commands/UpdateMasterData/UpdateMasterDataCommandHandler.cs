using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.MasterData.Common;
using STEP.Domain.Entities.Master;

namespace STEP.Application.Features.MasterData.Commands.UpdateMasterData
{
    public class UpdateMasterDataCommandHandler(IApplicationDbContext db)
        : IRequestHandler<UpdateMasterDataCommand, MasterDataItemDto>
    {
        public async Task<MasterDataItemDto> Handle(UpdateMasterDataCommand request, CancellationToken cancellationToken)
        {
            MasterDataEntity? entity = request.Category.ToLowerInvariant() switch
            {
                "roles" => await db.MasterRoles.FindAsync(new object[] { request.Id }, cancellationToken),
                "departments" => await db.MasterDepartments.FindAsync(new object[] { request.Id }, cancellationToken),
                "hiringlocations" => await db.MasterHiringLocations.FindAsync(new object[] { request.Id }, cancellationToken),
                "testlocations" => await db.MasterTestLocations.FindAsync(new object[] { request.Id }, cancellationToken),
                "employmenttypes" => await db.MasterEmploymentTypes.FindAsync(new object[] { request.Id }, cancellationToken),
                "experiencelevels" or "experiences" => await db.MasterExperienceLevels.FindAsync(new object[] { request.Id }, cancellationToken),
                _ => throw new NotFoundException("MasterDataCategory", request.Category)
            };

            if (entity is null)
                throw new NotFoundException("MasterDataEntity", request.Id);

            entity.Name = request.Name;
            entity.Code = request.Code;
            entity.Description = request.Description;
            entity.IsActive = request.IsActive;

            await db.SaveChangesAsync(cancellationToken);

            return new MasterDataItemDto(
                entity.Id.ToString(),
                entity.Name,
                entity.Code,
                entity.Description,
                entity.IsActive ? "Active" : "Inactive",
                DateTime.UtcNow.ToString("yyyy-MM-dd")
            );
        }
    }
}
