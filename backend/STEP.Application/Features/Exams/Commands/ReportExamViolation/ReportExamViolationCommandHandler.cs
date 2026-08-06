using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Exams.Commands.SubmitExam;
using STEP.Domain.Entities.Exam;

namespace STEP.Application.Features.Exams.Commands.ReportExamViolation
{
    public class ReportExamViolationCommandHandler(IApplicationDbContext db, ISender mediator)
        : IRequestHandler<ReportExamViolationCommand, ReportExamViolationResultDto>
    {
        // Matches the frontend's existing 3-strike tab-switch rule — now enforced server-side too
        // instead of only being a client-side decision with no backend consequence.
        private const int AutoSubmitThreshold = 3;
        private const decimal IntegrityPenaltyPerViolation = 10.00m;

        public async Task<ReportExamViolationResultDto> Handle(ReportExamViolationCommand request, CancellationToken cancellationToken)
        {
            var session = await db.CandidateExamSessions
                .FirstOrDefaultAsync(s => s.SessionToken == request.SessionToken, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateExamSession), request.SessionToken);

            // A violation ping racing with submission/expiry is expected (the candidate may be
            // mid-submit when the report lands) — ignore rather than error, since the session is
            // already wrapping up one way or another.
            if (session.SessionStatus != "InProgress")
            {
                return new ReportExamViolationResultDto(session.TabSwitchWarnings, session.AssessmentIntegrityScore, false, null);
            }

            session.TabSwitchWarnings += 1;
            session.AssessmentIntegrityScore = System.Math.Max(0, session.AssessmentIntegrityScore - IntegrityPenaltyPerViolation);

            await db.SaveChangesAsync(cancellationToken);

            if (session.TabSwitchWarnings >= AutoSubmitThreshold)
            {
                var submitResult = await mediator.Send(new SubmitExamCommand(request.SessionToken), cancellationToken);
                return new ReportExamViolationResultDto(session.TabSwitchWarnings, session.AssessmentIntegrityScore, true, submitResult);
            }

            return new ReportExamViolationResultDto(session.TabSwitchWarnings, session.AssessmentIntegrityScore, false, null);
        }
    }
}
