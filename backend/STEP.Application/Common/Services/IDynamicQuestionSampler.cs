using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using STEP.Domain.Entities.Exam;
using STEP.Domain.Entities.Master;

namespace STEP.Application.Common.Services
{
    public class SectionPoolStatus
    {
        public int SectionRuleId { get; set; }
        public string SectionName { get; set; } = string.Empty;
        public int RequiredCount { get; set; }
        public int AvailableCount { get; set; }
        public bool IsReady { get; set; }
        public int MissingCount { get; set; }
    }

    public class PoolValidationResult
    {
        public bool IsReady { get; set; }
        public int TotalRequiredQuestions { get; set; }
        public int TotalAvailableQuestions { get; set; }
        public List<SectionPoolStatus> SectionStatuses { get; set; } = new();
        public string? ErrorMessage { get; set; }
    }

    public interface IDynamicQuestionSampler
    {
        Task<PoolValidationResult> ValidatePoolAvailabilityAsync(
            int roleHiringProfileId,
            CancellationToken cancellationToken);

        Task<List<CandidateExamSessionQuestion>> SampleAndLockQuestionsAsync(
            RoleHiringProfile profile,
            int candidateId,
            int vacancyId,
            string sessionToken,
            CancellationToken cancellationToken);
    }
}
