using System;

namespace STEP.Application.Common.Interfaces
{
    public record OfferLetterPdfModel(
        string CandidateName,
        string VacancyTitle,
        string EmploymentType,
        decimal OfferedCTC,
        DateTime JoiningDate,
        string PreparedByName,
        DateTime GeneratedAt);

    /// <summary>Kept behind an interface so Application never takes a direct QuestPDF dependency.</summary>
    public interface IOfferLetterPdfGenerator
    {
        byte[] Generate(OfferLetterPdfModel model);
    }
}
