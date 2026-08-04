using STEP.Domain.Common;

namespace STEP.Domain.Entities.Exam
{
    /// <summary>One row per option the candidate selected for a SINGLE_CHOICE/MULTI_CHOICE answer.</summary>
    public class CandidateExamAnswerOption : BaseEntity
    {
        public int CandidateExamAnswerId { get; set; }
        public CandidateExamAnswer CandidateExamAnswer { get; set; } = null!;

        public int CandidateExamSessionQuestionOptionId { get; set; }
        public CandidateExamSessionQuestionOption CandidateExamSessionQuestionOption { get; set; } = null!;
    }
}
