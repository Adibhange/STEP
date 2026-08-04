using System.IO;
using MediatR;
using STEP.Application.Features.QuestionPapers.Common;

namespace STEP.Application.Features.QuestionPapers.Commands.ImportVacancyQuestions
{
    /// <summary>Only valid while the target paper is Status = Draft (Published papers are immutable).</summary>
    public record ImportVacancyQuestionsCommand(int VacancyQuestionPaperId, Stream FileStream) : IRequest<QuestionImportResultDto>;
}
