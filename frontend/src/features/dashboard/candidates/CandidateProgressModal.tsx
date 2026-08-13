'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/design-system';
import type { DashboardCandidate } from '../types/dashboard.types';
import { getCandidateFlowStages } from './candidateFlowData';

interface CandidateProgressModalProps {
  candidate: DashboardCandidate | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile: (candidateId: string) => void;
}

export const CandidateProgressModal: React.FC<CandidateProgressModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onNavigateToProfile,
}) => {
  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!candidate || !isOpen) return null;

  const stages = getCandidateFlowStages(candidate);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          aria-hidden="true"
        />

        {/* Centered Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="progress-modal-title"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-[var(--surface-2)] border-b border-[var(--border-default)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] font-bold text-sm flex items-center justify-center shrink-0 border border-[var(--accent-indigo)]/30">
                {candidate.name.split(' ').map((w) => w[0]).join('')}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 id="progress-modal-title" className="font-extrabold text-sm sm:text-base text-[var(--text-primary)] font-heading truncate">
                    {candidate.name}
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                    {candidate.code}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-secondary)] truncate">
                  {candidate.role} • {candidate.experience || `${candidate.experienceYears} Yrs`} • {candidate.hiringLocation}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer shrink-0"
              aria-label="Close dialog"
            >
              <Icon name="x" size="sm" />
            </button>
          </div>

          {/* Body: Flipkart Delivery Timeline */}
          <div className="p-5 overflow-y-auto scrollbar-step flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--accent-indigo)] uppercase tracking-wider font-heading flex items-center gap-1.5">
                <Icon name="list" size="xs" />
                Hiring Pipeline Delivery Tracker
              </span>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                Current Stage: <strong className="text-[var(--status-warning)]">{candidate.currentRound}</strong>
              </span>
            </div>

            {/* Vertical Spine */}
            <div className="relative pl-8 flex flex-col gap-4 pt-1">
              {stages.map((stage, index) => {
                const isLast = index === stages.length - 1;
                const isPassed = stage.status === 'Passed';
                const isInProgress = stage.status === 'In-Progress';
                const isRejected = stage.status === 'Failed';

                return (
                  <div key={stage.id} className="relative">
                    {/* Vertical connecting line */}
                    {!isLast && (
                      <div
                        className={`absolute -left-8 top-7 bottom-[-18px] w-0.5 transform translate-x-[13px] z-0 ${
                          isPassed
                            ? 'bg-[var(--status-success)]'
                            : isInProgress
                            ? 'bg-gradient-to-b from-[var(--status-warning)] to-[var(--border-soft)]'
                            : 'border-l-2 border-dashed border-[var(--border-default)]'
                        }`}
                      />
                    )}

                    {/* Milestone node badge */}
                    <div className="absolute -left-8 top-1.5 z-10 flex items-center justify-center">
                      {isPassed ? (
                        <span className="w-6.5 h-6.5 rounded-full bg-[var(--status-success)] text-white flex items-center justify-center shadow-xs ring-4 ring-[var(--surface-1)]">
                          <Icon name="check" size="xs" className="stroke-[3]" />
                        </span>
                      ) : isRejected ? (
                        <span className="w-6.5 h-6.5 rounded-full bg-[var(--status-danger)] text-white flex items-center justify-center shadow-xs ring-4 ring-[var(--surface-1)]">
                          <Icon name="x" size="xs" className="stroke-[3]" />
                        </span>
                      ) : isInProgress ? (
                        <span className="relative flex h-6.5 w-6.5 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-warning)] opacity-40" />
                          <span className="relative w-6.5 h-6.5 rounded-full bg-[var(--status-warning)] text-black font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-[var(--surface-1)]">
                            {stage.id}
                          </span>
                        </span>
                      ) : (
                        <span className="w-6.5 h-6.5 rounded-full bg-[var(--surface-3)] text-[var(--text-tertiary)] border border-[var(--border-default)] font-bold text-xs flex items-center justify-center ring-4 ring-[var(--surface-1)]">
                          {stage.id}
                        </span>
                      )}
                    </div>

                    {/* Stage Details Card */}
                    <div
                      className={`p-3 rounded-xl border transition-all ${
                        isPassed
                          ? 'bg-[var(--surface-2)] border-[var(--status-success)]/30'
                          : isInProgress
                          ? 'bg-[var(--surface-1)] border-[var(--status-warning)] shadow-xs ring-1 ring-[var(--status-warning)]/20'
                          : 'bg-[var(--surface-2)]/60 border-[var(--border-default)] opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-xs text-[var(--text-primary)] font-heading">
                          {stage.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPassed
                              ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]'
                              : isInProgress
                              ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border-[var(--status-warning-border)]'
                              : isRejected
                              ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border-[var(--status-danger-border)]'
                              : 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border-[var(--border-default)]'
                          }`}
                        >
                          {stage.status}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-4 text-[11px] text-[var(--text-secondary)] flex-wrap">
                        <span className="flex items-center gap-1 font-mono text-[10.5px]">
                          <Icon name="calendar" size="xs" className="text-[var(--text-tertiary)]" />
                          {stage.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="user" size="xs" className="text-[var(--text-tertiary)]" />
                          {stage.interviewer}
                        </span>
                        {stage.score && (
                          <span className="font-bold text-[var(--status-success)]">
                            Score: {stage.score}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[11px] text-[var(--text-tertiary)] leading-snug">
                        {stage.feedback}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-[var(--surface-2)] border-t border-[var(--border-default)] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-1)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Close (ESC)
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToProfile(String(candidate.id));
              }}
              className="px-4 py-1.5 rounded-lg border border-[var(--accent-indigo)] bg-[var(--accent-indigo)] text-white text-xs font-bold hover:bg-[var(--accent-indigo-hover)] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>Open Full 360° Profile</span>
              <Icon name="external-link" size="xs" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
