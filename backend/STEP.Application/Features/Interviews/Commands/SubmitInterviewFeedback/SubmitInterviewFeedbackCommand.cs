using MediatR;

namespace STEP.Application.Features.Interviews.Commands.SubmitInterviewFeedback
{
    /// <summary>Upsert — a panelist resubmitting replaces their earlier scorecard for this interview.</summary>
    public record SubmitInterviewFeedbackCommand(
        int InterviewId,
        int PanelistUserId,
        int TechnicalRating,
        int CommunicationRating,
        int ProblemSolvingRating,
        int CulturalFitRating,
        string? Strengths,
        string? Weaknesses,
        string Recommendation,
        string? Comments) : IRequest<bool>;
}
