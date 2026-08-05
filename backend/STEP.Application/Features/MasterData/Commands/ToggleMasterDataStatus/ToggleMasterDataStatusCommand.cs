using MediatR;

namespace STEP.Application.Features.MasterData.Commands.ToggleMasterDataStatus
{
    /// <summary>
    /// Toggles the IsActive status of any master data entity (roles, departments, hiringlocations, testlocations, employmenttypes).
    /// </summary>
    public record ToggleMasterDataStatusCommand(int Id, string Category) : IRequest<bool>;
}
