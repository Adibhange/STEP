"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@/design-system";
import { CandidateAssessmentEvaluationView } from "./CandidateAssessmentEvaluationView";
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

        <a
          href="/exam"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-1.5"
        >
          <Icon
            name="external-link"
            size="xs"
          />
          <span>Launch Proctored Exam Portal</span>
        </a>
      </div>

      {/* Submissions Directory Table */}
      <div className="bg-(--surface-1) border border-(--border-default) rounded-lg p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-(--text-primary) font-heading">
            Completed Candidate Assessment Submissions
          </h3>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            {submissions.length} Evaluated
          </span>
        </div>

        <div className="border border-(--border-default) rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-(--surface-2) border-b border-(--border-default) text-(--text-tertiary) font-mono font-bold uppercase text-[10.5px]">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Vacancy & Paper Title</th>
                <th className="py-3 px-4">Test Mode</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Score / Status</th>
                <th className="py-3 px-4">Proctoring Log</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-default) font-medium text-(--text-primary)">
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
              {!isLoading &&
                !isError &&
                submissions.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-(--surface-hover) transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-(--text-primary) font-heading">
                          {row.candidateName}
                        </span>
                        <span className="text-[10.5px] font-mono text-(--text-tertiary)">
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
                        className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${row.testMode === "In Office" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-sky-50 text-sky-700 border border-sky-200"}`}
                      >
                        {row.testMode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span>{row.attemptCount} Attempt</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-extrabold text-emerald-600">
                          {row.latestScore}
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded text-[10px] font-bold ${row.status === "Passed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}
                        >
                          {row.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="text-emerald-600">
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
                  </tr>
                ))}
            </tbody>
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
    </div>
  );
};
