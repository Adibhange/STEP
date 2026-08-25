'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';

interface CandidateExamPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string | number;
    code?: string;
    name: string;
    email: string;
    designation: string;
  };
  roundTitle?: string;
  roundNumber?: number;
}

export const CandidateExamPassModal: React.FC<CandidateExamPassModalProps> = ({
  isOpen,
  onClose,
  candidate,
  roundTitle = 'Aptitude Assessment',
  roundNumber = 1,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const candidateCode = candidate.code || String(candidate.id);
  const defaultPasscode = '1234';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const directExamUrl = `${origin}/exam?code=${encodeURIComponent(candidateCode)}&pass=${encodeURIComponent(defaultPasscode)}&round=${roundNumber}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directExamUrl);
      setCopiedLink(true);
      toast.success('Exam Link Copied', { description: 'Direct candidate assessment link copied to clipboard.' });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Copy Failed', { description: 'Could not copy link to clipboard.' });
    }
  };

  const handleCopyPin = async () => {
    try {
      await navigator.clipboard.writeText(defaultPasscode);
      setCopiedPin(true);
      toast.success('PIN Copied', { description: 'Candidate 4-digit PIN copied.' });
      setTimeout(() => setCopiedPin(false), 2000);
    } catch {
      toast.error('Copy Failed', { description: 'Could not copy PIN.' });
    }
  };

  const handleEmailPass = () => {
    toast.success('Exam Pass Sent', {
      description: `Access link and credentials dispatched to ${candidate.email || 'candidate email'}.`,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="dialog-card w-full max-w-lg rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] shadow-2xl p-5 sm:p-6 overflow-hidden relative cursor-default"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-[var(--border-soft)]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 border ${
                roundNumber === 1
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] border-[var(--accent-indigo)]/30'
              }`}>
                <Icon name="link" size="sm" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-heading">
                  {roundNumber === 1 ? 'Aptitude Exam Access Pass' : 'Technical Exam Access Pass'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Shareable test link &amp; security PIN for this candidate
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
            >
              <Icon name="x" size="sm" />
            </button>
          </div>

          {/* Candidate Card Summary */}
          <div className="mt-4 p-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                {candidate.name}
              </span>
              <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-soft)]">
                {candidateCode}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Applied Role: <strong className="text-[var(--text-primary)]">{candidate.designation}</strong></span>
              <span className="truncate max-w-[180px]">{candidate.email}</span>
            </div>
          </div>

          {/* Direct Exam URL */}
          <div className="mt-4 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">Direct Exam Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-9 px-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-mono text-[var(--text-secondary)] flex items-center truncate select-all">
                {directExamUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`h-9 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs ${
                  copiedLink
                    ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)]'
                    : 'bg-[var(--accent-indigo)] text-white hover:bg-[var(--accent-indigo-hover)]'
                }`}
              >
                <Icon name={copiedLink ? 'check' : 'copy'} size="xs" />
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Security Passcode / PIN */}
          <div className="mt-3 flex items-center justify-between p-3 rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)]">
            <div className="flex flex-col">
              <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-mono font-bold tracking-wider">Candidate Passcode PIN</span>
              <span className="font-mono text-base font-bold text-[var(--text-primary)] tracking-widest mt-0.5">{defaultPasscode}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyPin}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                copiedPin
                  ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border-[var(--status-success-border)]'
                  : 'bg-[var(--surface-3)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <Icon name={copiedPin ? 'check' : 'copy'} size="xs" />
              <span>{copiedPin ? 'Copied PIN' : 'Copy PIN'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border-soft)] mt-4">
            <button
              type="button"
              onClick={() => window.open(directExamUrl, '_blank')}
              className="h-8.5 px-3.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors inline-flex items-center gap-1.5"
            >
              <Icon name="external-link" size="xs" />
              <span>Open in New Tab</span>
            </button>

            <button
              type="button"
              onClick={handleEmailPass}
              className="h-8.5 px-4 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-bold hover:bg-[var(--accent-indigo-hover)] cursor-pointer shadow-2xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Icon name="send" size="xs" />
              <span>Email to Candidate</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
