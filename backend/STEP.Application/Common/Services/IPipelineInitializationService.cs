using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using STEP.Application.Features.Candidates.Common;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;
using VacancyEntity = STEP.Domain.Entities.Vacancy.Vacancy;

namespace STEP.Application.Common.Services
{
    public interface IPipelineInitializationService
    {
        Task<List<PipelineProgressDto>> InitializeCandidatePipelineAsync(
            CandidateEntity candidate, 
            VacancyEntity vacancy, 
            bool isDirect, 
            CancellationToken cancellationToken);
    }
}
