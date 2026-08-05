using MediatR;

namespace STEP.Application.Features.MasterData.Commands.DeleteMasterData
{
    public record DeleteMasterDataCommand(int Id, string Category) : IRequest<bool>;
}
