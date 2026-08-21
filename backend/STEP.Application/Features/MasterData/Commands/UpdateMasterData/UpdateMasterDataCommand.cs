using MediatR;
using STEP.Application.Features.MasterData.Common;

namespace STEP.Application.Features.MasterData.Commands.UpdateMasterData
{
    public record UpdateMasterDataCommand(
        int Id,
        string Category,
        string Name,
        string Code,
        string? Description,
        bool IsActive,
        decimal? MinYears = null,
        decimal? MaxYears = null) : IRequest<MasterDataItemDto>;
}
