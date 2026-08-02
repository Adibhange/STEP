'use client';

import React from 'react';
import { Icon } from '@/design-system';

export const AssessmentsView: React.FC = () => {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
          Candidate Assessments
        </h1>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
          Proctored online test submissions, automated scoring, and candidate evaluations.
        </p>
      </div>

      <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-2xs">
        <div className="flex items-center gap-3 border-b border-[var(--border-default)] pb-4">
          <span className="w-10 h-10 rounded-xl bg-[var(--status-info-bg)] text-[var(--status-info-text)] flex items-center justify-center font-bold">
            <Icon name="clipboard-check" size="md" />
          </span>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] font-heading">Online Proctored Evaluation Hub</h3>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">143 candidates currently completed or taking active assessments.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
