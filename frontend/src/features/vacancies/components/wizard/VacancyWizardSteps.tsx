'use client';

import React from 'react';
import { Icon } from '@/design-system';

export interface StepDef {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

interface VacancyWizardStepsProps {
  steps: StepDef[];
  currentStep: 1 | 2 | 3 | 4;
  onStepClick: (stepId: 1 | 2 | 3 | 4) => void;
}

export const VacancyWizardSteps: React.FC<VacancyWizardStepsProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="px-4 sm:px-5 pt-3.5 pb-2 bg-[var(--surface-2)]/40 border-b border-[var(--border-default)] shrink-0 font-sans">
      <div className="space-y-2 p-3 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-indigo-50/60 shadow-2xs">
        <div className="flex items-center justify-between text-[12px] font-bold">
          <span className="text-[var(--text-primary)] font-heading flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10.5px] font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
              {currentStep}
            </span>
            <span>Step {currentStep} of 4:</span>
            <span className="font-extrabold text-indigo-700 font-sans">
              {steps[currentStep - 1]?.title}
            </span>
          </span>
          <span className="text-[11px] font-mono font-bold text-purple-700">
            {currentStep * 25}% Complete
          </span>
        </div>

        <div className="relative h-1.5 bg-indigo-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 rounded-full"
            style={{ width: `${currentStep * 25}%` }}
          />
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2.5">
        {steps.map((st) => {
          const isActive = st.id === currentStep;
          const isPassed = st.id < currentStep;

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onStepClick(st.id as 1 | 2 | 3 | 4)}
              className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--surface-1)] border border-indigo-200 text-indigo-700 shadow-2xs'
                  : isPassed
                  ? 'bg-emerald-50/50 border border-emerald-100 text-emerald-800 hover:bg-emerald-50'
                  : 'bg-[var(--surface-1)]/60 border border-[var(--border-default)] text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 font-bold ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : isPassed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[var(--surface-3)] text-[var(--text-tertiary)]'
                }`}
              >
                {isPassed ? <Icon name="check-circle" size="xs" /> : st.id}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold truncate leading-tight">{st.title}</div>
                <div className="text-[9.5px] opacity-75 truncate">{st.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
