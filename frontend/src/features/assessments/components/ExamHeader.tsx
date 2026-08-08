'use client';

import React from 'react';
import { Icon } from '@/design-system';

interface ExamHeaderProps {
  paperTitle: string;
  candidateName: string;
  candidateCode: string;
  testMode: 'From Home' | 'In Office';
  secondsRemaining: number;
  formatTime: (sec: number) => string;
  onFinishClick: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  paperTitle,
  candidateName,
  candidateCode,
  testMode,
  secondsRemaining,
  formatTime,
  onFinishClick,
}) => {
  const isUrgent = secondsRemaining <= 300;

  return (
    <header className="bg-[var(--surface-1)] border-b border-[var(--border-default)] px-4 py-3 flex items-center justify-between shrink-0 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center shrink-0 border border-[var(--accent-indigo)]/20">
          <Icon name="clipboard-check" size="sm" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-[var(--text-primary)] font-heading leading-tight">
            {paperTitle}
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)] mt-0.5">
            <span className="font-semibold text-[var(--text-secondary)]">{candidateName}</span>
            <span>•</span>
            <span className="font-mono text-[10.5px]">{candidateCode}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface-2)] border border-[var(--border-default)]">
              {testMode}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Countdown Timer */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-xs transition-colors ${
            isUrgent
              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
              : 'bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--border-default)]'
          }`}
        >
          <Icon name="calendar" size="xs" className={isUrgent ? 'text-rose-600' : 'text-[var(--accent-indigo)]'} />
          <span>{formatTime(secondsRemaining)}</span>
        </div>

        <button
          type="button"
          onClick={onFinishClick}
          className="h-8.5 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-2xs hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Icon name="check-circle" size="xs" />
          <span>Submit Exam</span>
        </button>
      </div>
    </header>
  );
};
