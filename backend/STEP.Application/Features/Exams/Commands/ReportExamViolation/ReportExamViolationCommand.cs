using MediatR;
using STEP.Application.Features.Exams.Commands.SubmitExam;
using STEP.Application.Features.Exams.Common;

namespace STEP.Application.Features.Exams.Commands.ReportExamViolation
{
    /// <summary>Recorded when the candidate-facing UI detects a possible integrity violation (currently: tab/window switch).</summary>
    public record ReportExamViolationCommand(string SessionToken, string ViolationType) : IRequest<ReportExamViolationResultDto>;

    public record ReportExamViolationResultDto(
        int TabSwitchWarnings,
        decimal AssessmentIntegrityScore,
        bool AutoSubmitted,
        SubmitExamResultDto? SubmitResult);
}
