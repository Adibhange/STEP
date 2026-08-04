using MediatR;
using STEP.Application.Features.Reports.Common;

namespace STEP.Application.Features.Reports.Queries.GetRecruitmentFunnel
{
    public record GetRecruitmentFunnelQuery : IRequest<RecruitmentFunnelDto>;
}
