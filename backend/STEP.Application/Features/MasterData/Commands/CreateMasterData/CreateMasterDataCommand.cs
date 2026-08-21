using MediatR;
using STEP.Application.Features.MasterData.Common;

namespace STEP.Application.Features.MasterData.Commands.CreateMasterData
{
    public record CreateMasterDataCommand(
        string Category,
        string Name,
        string Code,
        string? Description,
        bool IsActive = true,
        decimal? MinYears = null,
        decimal? MaxYears = null) : IRequest<MasterDataItemDto>;
}
