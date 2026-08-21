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
                "employmenttypes" => new MasterEmploymentType(),
                "experiencelevels" or "experiences" => new MasterExperienceLevel
                {
                    MinYears = request.MinYears ?? 0.0m,
                    MaxYears = request.MaxYears ?? 99.0m
                },
                _ => throw new NotFoundException("MasterDataCategory", request.Category)
            };

            entity.Name = request.Name.Trim();
            entity.Code = request.Code.Trim().ToUpperInvariant();
            entity.Description = request.Description?.Trim();
            entity.IsActive = request.IsActive;

            switch (request.Category.ToLowerInvariant())
            {
                case "roles": db.MasterRoles.Add((MasterRole)entity); break;
                case "departments": db.MasterDepartments.Add((MasterDepartment)entity); break;
                case "hiringlocations": db.MasterHiringLocations.Add((MasterHiringLocation)entity); break;
                case "employmenttypes": db.MasterEmploymentTypes.Add((MasterEmploymentType)entity); break;
                case "experiencelevels" or "experiences": db.MasterExperienceLevels.Add((MasterExperienceLevel)entity); break;
            }

            await db.SaveChangesAsync(cancellationToken);

            decimal? retMin = entity is MasterExperienceLevel expL ? expL.MinYears : null;
            decimal? retMax = entity is MasterExperienceLevel expH ? expH.MaxYears : null;

            return new MasterDataItemDto(
                entity.Id.ToString(),
                entity.Name,
                entity.Code,
                entity.Description,
                entity.IsActive ? "Active" : "Inactive",
                DateTime.UtcNow.ToString("yyyy-MM-dd"),
                retMin,
                retMax
            );
        }
    }
}
