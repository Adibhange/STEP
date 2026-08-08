using System;
using System.Collections.Generic;
using System.Linq;
using STEP.Domain.Entities.Vacancy;

namespace STEP.Application.Common
{
    /// <summary>
    /// Director Interview is a shared, non-configurable final gate every pipeline flow must end
    /// with — HR only configures Round 1 (the compulsory Aptitude/HR-Screening gate) and the
    /// dynamic middle rounds; Director always comes last, and "Offer" is the terminal
    /// <see cref="STEP.Domain.Entities.Candidate.Candidate.Status"/> set once Director is passed
    /// (see CandidateAdvancementService — there's no separate "Offer" round to create).
    ///
    /// Without a real Director round in the database, CandidateAdvancementService has nowhere to
    /// send a candidate who clears the middle rounds — <c>nextRound</c> comes back null and it
    /// rejects them outright, even if the business rule says they should advance. This guards
    /// every place a flow's round list gets built or edited so that can't happen again.
    /// </summary>
    public static class PipelineFlowRoundDefaults
    {
        public const string DirectorRoundName = "Director Interview";

        public static void EnsureEndsWithDirectorRound(ICollection<VacancyPipelineFlowRound> rounds)
        {
            var hasDirectorRound = rounds.Any(r => string.Equals(r.Name, DirectorRoundName, StringComparison.OrdinalIgnoreCase));
            if (hasDirectorRound)
            {
                return;
            }

            var maxOrder = rounds.Count == 0 ? 0 : rounds.Max(r => r.RoundOrder);
            rounds.Add(new VacancyPipelineFlowRound
            {
                RoundOrder = maxOrder + 1,
                Name = DirectorRoundName,
                RoundType = "F2F", // classifies to "Interview" via PipelineRoundClassification
                CutoffPercent = 0,
            });
        }
    }
}
