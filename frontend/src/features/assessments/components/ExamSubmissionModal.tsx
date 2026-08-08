'use client';

import React from 'react';
import { Icon } from '@/design-system';

interface ExamSubmissionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  totalQuestions: number;
  answeredCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExamSubmissionModal: React.FC<ExamSubmissionModalProps> = ({
  isOpen,
  isSubmitting,
  totalQuestions,
  answeredCount,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer font-sans"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 cursor-default animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-emerald-600">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-200">
            <Icon name="check-circle" size="md" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading leading-tight">
              Submit Assessment?
            </h3>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
              Confirm early submission of your answers.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border-default)] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-tertiary)]">Total Questions:</span>
            <span className="font-bold text-[var(--text-primary)]">{totalQuestions}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-emerald-700 font-semibold">Answered:</span>
            <span className="font-bold text-emerald-700">{answeredCount}</span>
          </div>
          {unansweredCount > 0 && (
            <div className="flex items-center justify-between text-amber-700 font-semibold">
              <span>Unanswered:</span>
              <span className="font-bold">{unansweredCount}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
          Once submitted, your answers will be locked for grading and cannot be modified. Are you sure you want to finish?
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10 rounded-lg text-xs font-bold bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer disabled:opacity-50"
          >
            Return to Test
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-10 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Icon name="spinner" size="xs" className="animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Confirm Submit</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
