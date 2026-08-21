namespace STEP.Application.Features.MasterData.Common
{
    public record MasterDataItemDto(
        string Id,
        string Name,
        string Code,
        string? Description,
        string Status,
        string UpdatedAt,
        decimal? MinYears = null,
        decimal? MaxYears = null);
}
