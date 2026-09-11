using System;
using System.Linq;
using CandidateEntity = STEP.Domain.Entities.Candidate.Candidate;

namespace STEP.Application.Common
{
    /// <summary>
    /// Centralized, fail-proof helper for pipeline resolution:
    /// 1. Direct vs. Walk-in classification (eliminating brittle string comparisons)
    /// 2. IT vs. Non-IT assessment routing
    /// 3. Role-specific technology domain mapping (.NET vs. React vs. SQL vs. Non-IT)
    /// </summary>
    public static class CandidatePipelineHelper
    {
        /// <summary>
        /// Determines if candidate entered through Direct Sourcing (where Round 1 HR Screening is Auto-Passed).
        /// </summary>
        public static bool IsDirectCandidate(CandidateEntity candidate)
        {
            if (candidate == null) return false;

            // 1. Channel check (case-insensitive substring match)
            if (!string.IsNullOrWhiteSpace(candidate.RegistrationChannel))
            {
                var ch = candidate.RegistrationChannel.Trim();
                if (ch.Contains("Direct", StringComparison.OrdinalIgnoreCase) ||
                    ch.Contains("Sourced", StringComparison.OrdinalIgnoreCase) ||
                    ch.Contains("Referral", StringComparison.OrdinalIgnoreCase) ||
                    ch.Contains("Upload", StringComparison.OrdinalIgnoreCase) ||
                    ch.Contains("Manual", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }

            // 2. Vacancy drive type check
            if (candidate.Vacancy != null && !string.IsNullOrWhiteSpace(candidate.Vacancy.DriveType))
            {
                if (candidate.Vacancy.DriveType.Contains("Direct", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }

            // 3. Pipeline check: If Round 1 is already marked Passed or is HR Screening
            var r1 = candidate.PipelineProgressHistory?.FirstOrDefault(p => p.RoundNumber == 1);
            if (r1 != null)
            {
                var isR1Cleared = r1.Status == "Passed" || r1.Status == "Auto-Passed";
                var isR1Screening = !string.IsNullOrWhiteSpace(r1.RoundTitle) &&
                    (r1.RoundTitle.Contains("Screening", StringComparison.OrdinalIgnoreCase) ||
                     r1.RoundTitle.Contains("Auto-Passed", StringComparison.OrdinalIgnoreCase) ||
                     r1.RoundTitle.Contains("HR", StringComparison.OrdinalIgnoreCase));

                if (isR1Cleared && isR1Screening)
                {
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Determines if the vacancy/role belongs to the Non-IT Track (using standard MCQ / field assessment).
        /// </summary>
        public static bool IsNonITRole(CandidateEntity candidate)
        {
            if (candidate == null) return false;

            // 1. Blueprint check: explicitly assigned RULE-TECH-ENG or RULE-DATA-SQL -> Definitely IT
            var bpCode = candidate.Vacancy?.AssessmentBlueprint?.Code;
            if (bpCode == "RULE-TECH-ENG" || bpCode == "RULE-DATA-SQL")
            {
                return false;
            }

            if (bpCode == "RULE-MCQ-ONLY" || bpCode == "RULE-SURV-ASST")
            {
                return true;
            }

            // 2. Role taxonomy check
            var roleName = (candidate.Vacancy?.MasterRole?.Name ?? "").ToLowerInvariant();
            var vacTitle = (candidate.Vacancy?.Title ?? "").ToLowerInvariant();

            if (roleName.Contains("survey") || roleName.Contains("civil") ||
                roleName.Contains("admin") || roleName.Contains("field") ||
                vacTitle.Contains("survey") || vacTitle.Contains("civil") ||
                vacTitle.Contains("assistant") || vacTitle.Contains("field"))
            {
                return true;
            }

            // 3. Role is in common IT designations
            var isIT = roleName.Contains(".net") || roleName.Contains("c#") ||
                       roleName.Contains("software") || roleName.Contains("developer") ||
                       roleName.Contains("engineer") || roleName.Contains("react") ||
                       roleName.Contains("frontend") || roleName.Contains("sql") ||
                       roleName.Contains("data") || roleName.Contains("devops") || roleName.Contains("cloud") ||
                       vacTitle.Contains(".net") || vacTitle.Contains("c#") ||
                       vacTitle.Contains("software") || vacTitle.Contains("developer") ||
                       vacTitle.Contains("engineer") || vacTitle.Contains("react") ||
                       vacTitle.Contains("frontend") || vacTitle.Contains("sql") ||
                       vacTitle.Contains("data") || vacTitle.Contains("devops") || vacTitle.Contains("cloud");

            return !isIT;
        }

        /// <summary>
        /// Classifies the candidate's exact technical stack for role-specific question gating.
        /// Returns: "DOTNET", "REACT", "SQL", "DEVOPS", or "NONIT".
        /// </summary>
        public static string ResolveTechDomain(CandidateEntity candidate)
        {
            if (IsNonITRole(candidate))
            {
                return "NONIT";
            }

            var roleName = (candidate.Vacancy?.MasterRole?.Name ?? "").ToLowerInvariant();
            var vacTitle = (candidate.Vacancy?.Title ?? "").ToLowerInvariant();
            var combined = $"{roleName} {vacTitle}";
            var bpCode = candidate.Vacancy?.AssessmentBlueprint?.Code ?? "";

            // SQL / Database
            if (bpCode == "RULE-DATA-SQL" || combined.Contains("sql") || combined.Contains("database") || combined.Contains("data analyst"))
            {
                return "SQL";
            }

            // DevOps / Cloud
            if (combined.Contains("devops") || combined.Contains("cloud") || combined.Contains("infrastructure") || combined.Contains("sre"))
            {
                return "DEVOPS";
            }

            // C# / .NET specific check takes priority over generic 'developer'/'software'
            if (combined.Contains(".net") || combined.Contains("c#") || combined.Contains("csharp") || combined.Contains("asp.net"))
            {
                return "DOTNET";
            }

            // Frontend / React
            if (combined.Contains("react") || combined.Contains("frontend") || combined.Contains("front-end") ||
                combined.Contains("javascript") || combined.Contains("typescript") || combined.Contains("ui developer") ||
                combined.Contains("web developer"))
            {
                return "REACT";
            }

            // Default for IT engineering (.NET / C# backend stack)
            return "DOTNET";
        }
    }
}
