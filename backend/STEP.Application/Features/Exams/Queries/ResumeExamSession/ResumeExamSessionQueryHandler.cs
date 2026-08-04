using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Exams.Common;
using STEP.Domain.Entities.Exam;

namespace STEP.Application.Features.Exams.Queries.ResumeExamSession
{
    public class ResumeExamSessionQueryHandler(IApplicationDbContext db) : IRequestHandler<ResumeExamSessionQuery, LiveExamWorkspaceDto>
    {
        public async Task<LiveExamWorkspaceDto> Handle(ResumeExamSessionQuery request, CancellationToken cancellationToken)
        {
            var session = await db.CandidateExamSessions
                .Include(s => s.Questions).ThenInclude(q => q.Options)
                .Include(s => s.Answers).ThenInclude(a => a.SelectedOptions)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.SessionToken == request.SessionToken, cancellationToken)
                ?? throw new NotFoundException(nameof(CandidateExamSession), request.SessionToken);

            return ExamWorkspaceMapper.ToWorkspaceDto(session);
        }
    }
}
