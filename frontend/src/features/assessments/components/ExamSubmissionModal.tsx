'use client';

import React from 'react';
import { EnterpriseModal } from '@/design-system';

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
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onCancel}
      title="Submit Assessment?"
      subtitle="Confirm early submission of your answers."
      icon="check-circle"
      iconColorClass="text-emerald-500"
      iconBgClass="bg-emerald-500/10 border-emerald-500/30"
      maxWidth="md"
      submitText={isSubmitting ? 'Submitting…' : 'Confirm Submit'}
      cancelText="Return to Test"
      isSubmitting={isSubmitting}
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-default)] space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-tertiary)]">Total Questions:</span>
            <span className="font-bold text-[var(--text-primary)]">{totalQuestions}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Answered:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{answeredCount}</span>
          </div>
          {unansweredCount > 0 && (
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-semibold">
              <span>Unanswered:</span>
              <span className="font-bold">{unansweredCount}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Once submitted, your answers will be locked for grading and cannot be modified. Are you sure you want to finish?
        </p>
      </div>
    </EnterpriseModal>
  );
};
