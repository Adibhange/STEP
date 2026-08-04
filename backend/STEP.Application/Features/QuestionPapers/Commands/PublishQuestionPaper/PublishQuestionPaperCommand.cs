using MediatR;
using STEP.Application.Features.QuestionPapers.Common;

namespace STEP.Application.Features.QuestionPapers.Commands.PublishQuestionPaper
{
    public record PublishQuestionPaperCommand(int VacancyQuestionPaperId, int PublishedByUserId) : IRequest<QuestionPaperDto>;
}
