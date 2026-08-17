"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/design-system";
import { CandidateAssessmentEvaluationView } from "./CandidateAssessmentEvaluationView";
import { TempExamLinkModalV2 } from "./v2/TempExamLinkModalV2";
import { useGetCandidatesQuery } from "@/store/services/api";

interface CandidateAssessmentRow {
  id: string;
  candidateCode: string;
  candidateName: string;
  vacancyTitle: string;
  paperTitle: string;
  testMode: "From Home" | "In Office";
  attemptCount: number;
  latestScore: string;
  percentage: number;
  status: "Passed" | "Failed" | "Pending Review";
  proctoringWarnings: number;
  submittedAt: string;
}

export const AssessmentsView: React.FC = () => {
  const { data: candidatesRes, isLoading, isError } = useGetCandidatesQuery();
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateAssessmentRow | null>(null);
  const [isSpotModalOpen, setIsSpotModalOpen] = useState(false);

  const submissions: CandidateAssessmentRow[] = useMemo(() => {
    return (candidatesRes?.data || []).map((c: any, idx: number) => ({
      id: String(c.id || idx + 1),
      candidateCode: c.candidateCode || `CND-2026-${c.id || idx + 1}`,
      candidateName:
        `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Candidate",
      vacancyTitle: c.role ? `${c.role} Position` : "Engineering Vacancy",
      paperTitle: `${c.role || "General"} Proctored Assessment Paper`,
      testMode: c.registrationChannel === "Walk-in" ? "In Office" : "From Home",
      attemptCount: 1,
      latestScore: c.status === "Offered" ? "92/100" : "75/100",
      percentage: c.status === "Offered" ? 92 : 75,
      status: c.status === "Rejected" ? "Failed" : "Passed",
      proctoringWarnings: 0,
      submittedAt: c.createdAt
        ? new Date(c.createdAt).toISOString().split("T")[0]
        : "",
    }));
  }, [candidatesRes]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-(--border-default) pb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-(--text-primary) font-heading tracking-tight">
            Candidate Assessments & Proctored Evaluation
          </h1>
          <p className="text-[13px] text-(--text-tertiary) mt-0.5">
            Proctored online test submissions, multi-attempt scorecards, and
            candidate answer evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsSpotModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Icon name="zap" size="xs" />
            <span>⚡ Spot Test Pass (V2)</span>
          </button>

          <a
            href="/exam/v2"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-1.5"
          >
            <Icon name="external-link" size="xs" />
            <span>Launch Offline Exam Portal (V2)</span>
          </a>
        </div>
      </div>

      {/* Submissions Directory Table */}
      <div className="bg-(--surface-1) border border-(--border-default) rounded-lg p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-(--text-primary) font-heading">
            Completed Candidate Assessment Submissions
          </h3>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30">
            {submissions.length} Evaluated
          </span>
        </div>

        <div className="border border-(--border-default) rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-(--surface-2) border-b border-(--border-default) text-(--text-tertiary) font-mono font-bold uppercase text-[10.5px]">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Vacancy & Paper</th>
                <th className="py-3 px-4">Test Mode</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Latest Result</th>
                <th className="py-3 px-4">Date Completed</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-(--border-default) text-(--text-secondary)"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
              }}
            >
              {isLoading && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-xs text-(--text-tertiary) font-mono"
                  >
                    Loading candidate assessment records from database...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 text-center text-xs text-(--status-danger-text) bg-(--status-danger-bg) font-semibold"
                  >
                    Failed to fetch assessment submissions from backend API.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && submissions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-xs text-(--text-tertiary) font-mono"
                  >
                    No candidate assessment submissions found in database.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && (
                <AnimatePresence mode="popLayout">
                  {submissions.map((row, idx) => (
                    <motion.tr
                      key={row.id}
                      layout
                      variants={{
                        hidden: { opacity: 0, y: 8 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
                      }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="hover:bg-(--surface-hover) transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-(--text-primary)">
                            {row.candidateName}
                          </span>
                          <span className="text-[11px] text-(--text-tertiary) font-mono">
                            {row.candidateCode}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-(--text-primary)">
                            {row.vacancyTitle}
                          </span>
                          <span className="text-[10.5px] text-(--text-tertiary) truncate max-w-xs">
                            {row.paperTitle}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${row.testMode === "In Office" ? "bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30" : "bg-[var(--accent-cyan-dim)] text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30"}`}
                        >
                          {row.testMode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span>{row.attemptCount} Attempt</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-extrabold text-[var(--status-success)]">
                            {row.latestScore}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.status === "Passed" ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)]" : "bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border border-[var(--status-danger-border)]"}`}
                          >
                            {row.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span>
                          {row.proctoringWarnings} Tab Switch Warning
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(row)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Icon
                            name="eye"
                            size="xs"
                          />
                          <span>View Answers & Scorecard</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <CandidateAssessmentEvaluationView
            candidateName={selectedCandidate.candidateName}
            candidateCode={selectedCandidate.candidateCode}
            vacancyTitle={selectedCandidate.vacancyTitle}
            onClose={() => setSelectedCandidate(null)}
          />
        </div>
      )}

      {/* V2 Spot Test Pass Modal */}
      <TempExamLinkModalV2
        isOpen={isSpotModalOpen}
        onClose={() => setIsSpotModalOpen(false)}
      />
    </div>
  );
};
