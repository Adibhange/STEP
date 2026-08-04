using MediatR;
using STEP.Application.Features.Interviews.Common;

namespace STEP.Application.Features.Interviews.Queries.GetInterviewById
{
    public record GetInterviewByIdQuery(int Id) : IRequest<InterviewDto>;
}
