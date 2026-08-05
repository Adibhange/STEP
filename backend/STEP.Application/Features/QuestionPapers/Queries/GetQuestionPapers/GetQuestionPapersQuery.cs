using System.Collections.Generic;
using MediatR;
using STEP.Application.Features.QuestionPapers.Common;

namespace STEP.Application.Features.QuestionPapers.Queries.GetQuestionPapers
{
    public record GetQuestionPapersQuery : IRequest<List<QuestionPaperDto>>;
}
