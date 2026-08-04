using MediatR;
using STEP.Application.Features.Exams.Common;

namespace STEP.Application.Features.Exams.Queries.GetExamEvaluationView
{
    public record GetExamEvaluationViewQuery(int CandidateExamSessionId) : IRequest<ExamEvaluationViewDto>;
}
