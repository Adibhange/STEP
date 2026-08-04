using System;

namespace STEP.Application.Features.Offers.Common
{
    public record OfferLetterDto(
        int Id,
        int CandidateId,
        string CandidateName,
        int VacancyId,
        string VacancyTitle,
        decimal OfferedCTC,
        DateTime JoiningDate,
        string Status,
        string PreparedByName,
        string? ApprovedByName,
        DateTime? ApprovedAt,
        string? GeneratedPdfPath);
}
