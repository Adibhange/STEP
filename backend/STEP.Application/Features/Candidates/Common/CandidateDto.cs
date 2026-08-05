using System;
using System.Collections.Generic;

namespace STEP.Application.Features.Candidates.Common
{
    public record CandidateSummaryDto(
        int Id,
        string CandidateCode,
        string FirstName,
        string LastName,
        string Email,
        string Phone,
        int VacancyId,
        string VacancyTitle,
        string CurrentStage,
        string Status,
        DateTime CreatedAt);

    public record CandidateListResultDto(List<CandidateSummaryDto> Items, int TotalCount);

    public record PipelineProgressDto(
        int Id,
        int RoundNumber,
        string RoundTitle,
        string RoundType,
        string Status,
        decimal? ScoreObtained,
        DateTime? StartedAt,
        DateTime? CompletedAt);

    public record CandidateDocumentDto(
        int Id,
        string DocumentType,
        string FileName,
        string ContentType,
        long FileSizeBytes,
        string StorageProvider,
        DateTime UploadedAt);

    public record CandidateDto(
        int Id,
        string CandidateCode,
        string FirstName,
        string LastName,
        string Email,
        string Phone,
        int VacancyId,
        string VacancyTitle,
        string CurrentStage,
        string Status,
        string RegistrationChannel,
        string? ReferralEmployeeName,
        decimal TotalExperienceYears,
        decimal? CurrentCTC,
        decimal? ExpectedCTC,
        int? NoticePeriodDays,
        string? CurrentLocation,
        string? HighestQualification,
        DateTime CreatedAt,
        List<PipelineProgressDto> PipelineProgress,
        List<CandidateDocumentDto> Documents);
}
