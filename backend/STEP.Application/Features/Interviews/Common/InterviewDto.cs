using System;
using System.Collections.Generic;

namespace STEP.Application.Features.Interviews.Common
{
    public record InterviewRoundDetailDto(
        int Id,
        string PanelistName,
        int TechnicalRating,
        int CommunicationRating,
        int ProblemSolvingRating,
        int CulturalFitRating,
        string? Strengths,
        string? Weaknesses,
        string Recommendation,
        string? Comments,
        DateTime SubmittedAt);

    public record InterviewDto(
        int Id,
        int CandidateId,
        string CandidateName,
        string VacancyTitle,
        DateTime ScheduledAt,
        int DurationMinutes,
        string Mode,
        string? MeetingLinkOrLocation,
        string Status,
        List<InterviewRoundDetailDto> RoundDetails);

    public record InterviewPublishResultDto(
        int InterviewId,
        bool Passed,
        bool AdvancedToNextRound,
        string? NextRoundTitle,
        string? NextRoundExamPasscode,
        string CandidateStatus);
}
