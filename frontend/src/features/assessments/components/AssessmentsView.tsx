'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { CandidateAssessmentEvaluationView } from './CandidateAssessmentEvaluationView';

interface CandidateAssessmentRow {
  id: string;
  candidateCode: string;
  candidateName: string;
  vacancyTitle: string;
  paperTitle: string;
  testMode: 'From Home' | 'In Office';
  attemptCount: number;
  latestScore: string;
  percentage: number;
  status: 'Passed' | 'Failed' | 'Pending Review';
  proctoringWarnings: number;
  submittedAt: string;
}

const MOCK_ASSESSMENT_SUBMISSIONS: CandidateAssessmentRow[] = [
  {
    id: 'eval-101',
    candidateCode: 'CND-2026-1042',
    candidateName: 'Anjali Sharma',
    vacancyTitle: 'Senior React / Next.js Developer',
    paperTitle: 'Advanced React 19 & Next.js Enterprise Assessment',
    testMode: 'From Home',
    attemptCount: 2,
    latestScore: '98/100',
    percentage: 98,
    status: 'Passed',
    proctoringWarnings: 0,
    submittedAt: '18 May 2025',
  },
  {
    id: 'eval-102',
    candidateCode: 'CND-2026-1088',
    candidateName: 'Rahul Varma',
    vacancyTitle: 'Node.js Backend Microservices Lead',
    paperTitle: 'Node.js & PostgreSQL System Architecture Paper',
    testMode: 'In Office',
    attemptCount: 1,
    latestScore: '85/100',
    percentage: 85,
    status: 'Passed',
    proctoringWarnings: 1,
    submittedAt: '20 May 2025',
  },
  {
    id: 'eval-103',
    candidateCode: 'CND-2026-1104',
    candidateName: 'Priya Nair',
    vacancyTitle: 'QA Automation Engineer',
    paperTitle: 'Playwright & Automation Test Suite Paper',
    testMode: 'From Home',
    attemptCount: 1,
    latestScore: '58/100',
    percentage: 58,
    status: 'Failed',
    proctoringWarnings: 2,
    submittedAt: '21 May 2025',
  },
];

export const AssessmentsView: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateAssessmentRow | null>(null);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
            Candidate Assessments & Proctored Evaluation
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
            Proctored online test submissions, multi-attempt scorecards, and candidate answer evaluations.
          </p>
        </div>

        <a
          href="/exam?token=EXAM-MUM-2026-X89&mode=office"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-1.5"
        >
          <Icon name="external-link" size="xs" />
          <span>Launch Proctored Exam Portal Simulator</span>
        </a>
      </div>

      {/* Submissions Directory Table */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading">
            Completed Candidate Assessment Submissions
          </h3>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            {MOCK_ASSESSMENT_SUBMISSIONS.length} Evaluated
          </span>
        </div>

        <div className="border border-[var(--border-default)] rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-2)] border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-mono font-bold uppercase text-[10.5px]">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Vacancy & Paper Title</th>
                <th className="py-3 px-4">Test Mode</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Score / Status</th>
                <th className="py-3 px-4">Proctoring Log</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)] font-medium text-[var(--text-primary)]">
              {MOCK_ASSESSMENT_SUBMISSIONS.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--text-primary)] font-heading">{row.candidateName}</span>
                      <span className="text-[10.5px] font-mono text-[var(--text-tertiary)]">{row.candidateCode}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--text-primary)]">{row.vacancyTitle}</span>
                      <span className="text-[10.5px] text-[var(--text-tertiary)] truncate max-w-xs">{row.paperTitle}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${row.testMode === 'In Office' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
                      {row.testMode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span>{row.attemptCount} Attempt{row.attemptCount > 1 ? 's' : ''}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-extrabold text-emerald-600">{row.latestScore}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${row.status === 'Passed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {row.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className={row.proctoringWarnings > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600'}>
                      {row.proctoringWarnings} Tab Switch Warning{row.proctoringWarnings !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCandidate(row)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Icon name="eye" size="xs" />
                      <span>View Answers & Scorecard</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Candidate Evaluation Detail Modal View */}
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
