'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer font-sans"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="bg-surface-1 border border-border-default rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-status-success-text">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.05 }}
                className="w-10 h-10 rounded-2xl bg-status-success-bg flex items-center justify-center shrink-0 border border-status-success-border"
              >
                <Icon name="check-circle" size="md" />
              </motion.div>
              <div>
                <h3 className="text-base font-extrabold text-text-primary font-heading leading-tight">
                  Submit Assessment?
                </h3>
                <p className="text-[12px] text-text-tertiary mt-0.5">
                  Confirm early submission of your answers.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-2 border border-border-default space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-text-tertiary">Total Questions:</span>
                <span className="font-bold text-text-primary">{totalQuestions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-status-success-text font-semibold">Answered:</span>
                <span className="font-bold text-status-success-text">{answeredCount}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex items-center justify-between text-status-warning-text font-semibold">
                  <span>Unanswered:</span>
                  <span className="font-bold">{unansweredCount}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Once submitted, your answers will be locked for grading and cannot be modified. Are you sure you want to finish?
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onCancel}
                disabled={isSubmitting}
                className="h-10 rounded-xl text-xs font-bold bg-surface-2 text-text-secondary border border-border-default hover:bg-surface-3 transition-all cursor-pointer disabled:opacity-50"
              >
                Return to Test
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                disabled={isSubmitting}
                className="h-10 rounded-xl text-xs font-bold bg-status-success text-text-on-accent shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="spinner" size="xs" className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Confirm Submit</span>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
