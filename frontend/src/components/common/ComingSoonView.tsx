'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/design-system';

interface ComingSoonViewProps {
  title: string;
  description: string;
  moduleName: string;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({
  title,
  description,
  moduleName,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center">
      <div className="max-w-md w-full bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-8 shadow-md flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold shadow-2xs">
          <Icon name="lock" size="lg" />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-100/70 text-amber-800 border border-amber-300 self-center">
            ⚡ Module Status: Under Maintenance / In Progress
          </span>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)] font-heading mt-2">
            {title}
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] leading-relaxed mt-1">
            {description}
          </p>
        </div>

        <div className="w-full bg-[var(--surface-2)] border border-[var(--border-soft)] rounded-xl p-3.5 text-[12px] font-mono text-[var(--text-secondary)] text-left flex items-center justify-between">
          <span className="font-semibold">{moduleName}</span>
          <span className="text-[10.5px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">Temporarily Disabled</span>
        </div>

        <Link
          href="/dashboard"
          className="h-9 px-5 rounded-full bg-[var(--accent-indigo)] text-[var(--text-on-accent)] text-xs font-bold hover:bg-[var(--accent-indigo-hover)] transition-all flex items-center gap-1.5 shadow-2xs"
        >
          <Icon name="arrow-left" size="xs" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
