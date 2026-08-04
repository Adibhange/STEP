namespace STEP.Application.Common
{
    /// <summary>
    /// Maps a VacancyPipelineFlowRound's specific type (Aptitude/Technical/F2F/HR/Group Discussion —
    /// the frontend's PipelineRound.type) to the coarser Assessment/Interview classification the
    /// blueprint's CandidatePipelineProgress.RoundType actually uses to decide whether a round goes
    /// through the exam snapshot engine (Phase 4) or interview scheduling (Phase 5).
    /// </summary>
    public static class PipelineRoundClassification
    {
        public static string Classify(string vacancyPipelineFlowRoundType) => vacancyPipelineFlowRoundType switch
        {
            "Aptitude" => "Assessment",
            "Technical" => "Assessment",
            _ => "Interview", // F2F, HR, Group Discussion
        };
    }
}
