using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.MasterData.Common;
using STEP.Domain.Entities.Master;

namespace STEP.Application.Features.MasterData.Commands.CreateMasterData
{
    public class CreateMasterDataCommandHandler(IApplicationDbContext db)
        : IRequestHandler<CreateMasterDataCommand, MasterDataItemDto>
    {
        public async Task<MasterDataItemDto> Handle(CreateMasterDataCommand request, CancellationToken cancellationToken)
        {
            MasterDataEntity entity = request.Category.ToLowerInvariant() switch
            {
                "roles" => new MasterRole(),
                "departments" => new MasterDepartment(),
                "hiringlocations" => new MasterHiringLocation(),
                "testlocations" => new MasterTestLocation(),
                "employmenttypes" => new MasterEmploymentType(),
                "experiencelevels" or "experiences" => new MasterExperienceLevel(),
                _ => throw new NotFoundException("MasterDataCategory", request.Category)
            };

            entity.Name = request.Name;
            entity.Code = request.Code;
            entity.Description = request.Description;
            entity.IsActive = request.IsActive;

            switch (request.Category.ToLowerInvariant())
            {
                case "roles": db.MasterRoles.Add((MasterRole)entity); break;
                case "departments": db.MasterDepartments.Add((MasterDepartment)entity); break;
                case "hiringlocations": db.MasterHiringLocations.Add((MasterHiringLocation)entity); break;
                case "testlocations": db.MasterTestLocations.Add((MasterTestLocation)entity); break;
                case "employmenttypes": db.MasterEmploymentTypes.Add((MasterEmploymentType)entity); break;
                case "experiencelevels" or "experiences": db.MasterExperienceLevels.Add((MasterExperienceLevel)entity); break;
            }

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
