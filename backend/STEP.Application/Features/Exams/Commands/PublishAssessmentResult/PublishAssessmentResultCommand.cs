using MediatR;
using STEP.Application.Features.Exams.Common;

namespace STEP.Application.Features.Exams.Commands.PublishAssessmentResult
{
    public record PublishAssessmentResultCommand(int CandidateExamSessionId, string? Remarks, int PublishedByUserId) : IRequest<PublishResultDto>;
}
