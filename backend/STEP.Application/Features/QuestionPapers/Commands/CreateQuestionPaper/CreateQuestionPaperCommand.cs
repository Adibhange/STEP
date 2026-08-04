using MediatR;
using STEP.Application.Features.QuestionPapers.Common;

namespace STEP.Application.Features.QuestionPapers.Commands.CreateQuestionPaper
{
    /// <summary>Creates an empty Draft paper for a vacancy; questions are added afterward (manually or via Excel import).</summary>
    public record CreateQuestionPaperCommand(
        int VacancyId,
        string Title,
        int DurationMinutes,
        decimal PassingPercentage) : IRequest<QuestionPaperDto>;
}
