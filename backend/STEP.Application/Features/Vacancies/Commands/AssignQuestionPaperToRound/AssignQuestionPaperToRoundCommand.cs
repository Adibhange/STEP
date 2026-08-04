using MediatR;

namespace STEP.Application.Features.Vacancies.Commands.AssignQuestionPaperToRound
{
    /// <summary>
    /// Populates VacancyRoundAssessments — the decoupled link between a pipeline round and the
    /// (published) question paper used to evaluate it. Without this, StartExamSessionCommand has
    /// no way to know which paper a given Assessment round should present.
    /// </summary>
    public record AssignQuestionPaperToRoundCommand(int VacancyPipelineFlowRoundId, int VacancyQuestionPaperId) : IRequest<bool>;
}
