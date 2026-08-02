'use client';

import React from 'react';
import { Icon } from '@/design-system';

export const QuestionPapersView: React.FC = () => {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
            Question Papers Library
          </h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-0.5">
            Centralized reusable test papers & assessments assigned across enterprise vacancies.
          </p>
        </div>
        <button type="button" className="h-9 px-4 flex items-center gap-1.5 rounded-full bg-[var(--accent-indigo)] text-[var(--text-on-accent)] text-[12.5px] font-bold shadow-2xs cursor-pointer">
          <Icon name="plus" size="xs" />
          <span>Create Question Paper</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: 'qp-1', title: 'Advanced React 19 & TypeScript Enterprise Paper A', questions: 45, duration: '60 Mins', category: 'Frontend Engineering', status: 'Active' },
          { id: 'qp-2', title: 'Node.js & PostgreSQL System Architecture Paper', questions: 35, duration: '75 Mins', category: 'Backend Engineering', status: 'Active' },
          { id: 'qp-3', title: 'QA Automation & Cypress / Playwright Test Paper', questions: 40, duration: '60 Mins', category: 'Quality Assurance', status: 'Active' },
        ].map((qp) => (
          <div key={qp.id} className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)] px-2 py-0.5 rounded">{qp.category}</span>
                <span className="text-[11px] font-bold text-[var(--status-success-text)] bg-[var(--status-success-bg)] px-2 py-0.5 rounded-full font-mono">{qp.status}</span>
              </div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading">{qp.title}</h3>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)] mt-4 text-[12px] text-[var(--text-tertiary)] font-mono font-semibold">
              <span>{qp.questions} Questions</span>
              <span>{qp.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
