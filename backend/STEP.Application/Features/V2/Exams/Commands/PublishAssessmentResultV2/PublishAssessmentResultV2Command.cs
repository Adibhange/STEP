using MediatR;
using STEP.Application.Features.Exams.Common;

namespace STEP.Application.Features.V2.Exams.Commands.PublishAssessmentResultV2
{
    public record PublishAssessmentResultV2Command(
        int CandidateExamSessionId,
        string? Remarks = null,
        int? EvaluatorUserId = null
    ) : IRequest<PublishResultDto>;
}
