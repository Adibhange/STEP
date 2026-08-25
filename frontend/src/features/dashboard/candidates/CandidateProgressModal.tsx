'use client';

import React, { useMemo } from 'react';
import { Icon, EnterpriseModal } from '@/design-system';
import type { DashboardCandidate } from '../types/dashboard.types';
import { type HiringStageProgress } from './candidateFlowData';
import { useGetCandidateByIdQuery } from '@/store/services/api';

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
  // Cache candidate ref for smooth exit animation
  const lastCandidateRef = React.useRef(candidate);
  if (candidate) {
    lastCandidateRef.current = candidate;
  }
  const activeCandidate = candidate || lastCandidateRef.current;
  const candidateIdNum = Number(activeCandidate?.id);

  const { data: candidateDetailRes, isLoading } = useGetCandidateByIdQuery(candidateIdNum, {
    skip: !isOpen || !candidateIdNum,
  });

  const stages: HiringStageProgress[] = useMemo(() => {
    const rawHistory = candidateDetailRes?.data?.pipelineProgress || (candidateDetailRes?.data as any)?.pipelineProgressHistory;
    if (rawHistory && Array.isArray(rawHistory) && rawHistory.length > 0) {
      return rawHistory.map((p: any) => {
        const isAutoPassed = (p.roundTitle || '').toLowerCase().includes('auto-passed');
        const isPassed = p.status?.toLowerCase() === 'passed' || p.status?.toLowerCase() === 'cleared' || p.resultStatus?.toLowerCase() === 'pass' || isAutoPassed;
        const isFailed = p.status?.toLowerCase() === 'failed' || p.status?.toLowerCase() === 'rejected' || p.resultStatus?.toLowerCase() === 'fail';
        const isInProgress = p.status?.toLowerCase() === 'inprogress' || p.status?.toLowerCase() === 'in-progress';

        const statusStr: 'Passed' | 'In-Progress' | 'Pending' | 'Failed' = isPassed ? 'Passed' : isFailed ? 'Failed' : isInProgress ? 'In-Progress' : 'Pending';
        const statusType = isPassed ? 'passed' : isFailed ? 'rejected' : isInProgress ? 'warning' : 'pending';

        const dateStr = p.completedAt
          ? new Date(p.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : p.startedAt
            ? new Date(p.startedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : p.roundNumber === 1
              ? (activeCandidate?.appliedDate || '—')
              : '—';

        const scoreStr = p.scoreObtained !== null && p.scoreObtained !== undefined ? `${p.scoreObtained}%` : undefined;

        let feedbackText = 'Round pending.';
        if (isFailed) {
          feedbackText = p.remarks || (scoreStr ? `Assessment Score: ${scoreStr} (Failed)` : 'Candidate failed evaluation for this round.');
        } else if (isPassed) {
          feedbackText = p.remarks || (scoreStr ? `Assessment Score: ${scoreStr} (Passed)` : 'Round cleared successfully.');
        } else if (isInProgress) {
          feedbackText = 'Evaluation in progress.';
        }

        return {
          id: p.roundNumber,
          name: p.roundTitle || `Round ${p.roundNumber}`,
          roundType: p.roundType || 'Assessment',
          status: statusStr,
          statusType: statusType,
          date: dateStr,
          interviewer: p.interviewerName || (p.roundNumber === 1 ? 'HR Talent Acquisition' : p.roundType === 'Director' ? 'Director of Engineering' : 'Unassigned'),
          interviewerRole: p.roundNumber === 1 ? 'HR Talent Acquisition' : (p.roundType || 'Evaluator'),
          interviewerInitials: p.interviewerName
            ? p.interviewerName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
            : (p.roundNumber === 1 ? 'HR' : 'UA'),
          feedback: feedbackText,
          score: scoreStr,
        };
      });
    }

    return [];
  }, [candidateDetailRes, activeCandidate]);

  return (
    <EnterpriseModal
      isOpen={isOpen && !!activeCandidate}
      onClose={onClose}
      title={activeCandidate?.name || 'Candidate Details'}
      subtitle={
        activeCandidate
          ? `${activeCandidate.code} • ${activeCandidate.role} • ${activeCandidate.experience || `${activeCandidate.experienceYears} Yrs`} • ${activeCandidate.hiringLocation}`
          : undefined
      }
      icon="user"
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="h-9 sm:h-10 px-4 sm:px-5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Close (ESC)
          </button>

          {activeCandidate && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToProfile(String(activeCandidate.id));
              }}
              className="h-9 sm:h-10 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md hover:from-indigo-700 hover:to-purple-700 flex items-center gap-1.5 active:scale-95"
            >
              <span>Open Full 360° Profile</span>
              <Icon name="external-link" size="xs" />
            </button>
          )}
        </div>
      }
    >
      {activeCandidate && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--accent-indigo)] uppercase tracking-wider font-heading flex items-center gap-1.5">
              <Icon name="list" size="xs" />
              Hiring Pipeline Delivery Tracker
            </span>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
              Current Stage: <strong className="text-[var(--status-warning)]">{activeCandidate.currentRound}</strong>
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
      )}
    </EnterpriseModal>
  );
};
