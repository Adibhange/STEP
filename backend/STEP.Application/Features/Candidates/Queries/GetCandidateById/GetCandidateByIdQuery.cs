using MediatR;
using STEP.Application.Features.Candidates.Common;

namespace STEP.Application.Features.Candidates.Queries.GetCandidateById
{
    public record GetCandidateByIdQuery(int Id) : IRequest<CandidateDto>;
}
