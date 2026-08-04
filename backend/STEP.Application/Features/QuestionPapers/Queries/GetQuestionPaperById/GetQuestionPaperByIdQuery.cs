using MediatR;
using STEP.Application.Features.QuestionPapers.Common;

namespace STEP.Application.Features.QuestionPapers.Queries.GetQuestionPaperById
{
    public record GetQuestionPaperByIdQuery(int Id) : IRequest<QuestionPaperDto>;
}
