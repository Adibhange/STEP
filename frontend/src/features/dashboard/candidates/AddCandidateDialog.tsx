'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Icon,
} from '@/design-system';
import { ManualEntryForm } from './components/ManualEntryForm';
import { ExcelUploadForm } from './components/ExcelUploadForm';
import type { DashboardCandidate } from '../mock/candidate.mock';

interface AddCandidateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCandidateAdded?: (newCandidate: Partial<DashboardCandidate>) => void;
}

export const AddCandidateDialog: React.FC<AddCandidateDialogProps> = ({
  isOpen,
  onClose,
  onCandidateAdded,
}) => {
  // Active Tab Mode: 'manual' | 'excel'
  const [activeTab, setActiveTab] = useState<'manual' | 'excel'>('manual');

  const handleSuccess = (cand: Partial<DashboardCandidate>, addAnother?: boolean) => {
    onCandidateAdded?.(cand);
    if (!addAnother) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[760px] max-w-[95vw] h-auto max-h-[88vh] flex flex-col p-0 border border-[var(--border-default)] shadow-[var(--shadow-2xl)] rounded-[var(--radius-xl)] bg-[var(--surface-1)] overflow-hidden">

        {/* ── Dialog Header with Title & Dual Mode Selection Cards ────────── */}
        <DialogHeader className="px-6 pt-4 pb-3.5 border-b border-[var(--border-default)] mb-0 shrink-0 bg-[var(--surface-1)]">
          {/* Top Title & Close Row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center shrink-0 border border-[var(--accent-indigo)]/20 shadow-2xs">
                <Icon name="user-plus" size="sm" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] font-heading tracking-tight leading-none">
                  Add Candidate
                </DialogTitle>
                <p className="text-xs text-[var(--text-tertiary)] font-sans mt-0.5">
                  Select candidate creation method below
                </p>
              </div>
            </div>

            {/* Custom Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
              aria-label="Close dialog"
            >
              <Icon name="x" size="xs" />
            </button>
          </div>

          {/* Dual Selection Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Dual Card 1: Single Candidate Entry */}
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer select-none ${
                activeTab === 'manual'
                  ? 'border-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)]/40 shadow-xs ring-1 ring-[var(--accent-indigo)]/40'
                  : 'border-[var(--border-default)] bg-[var(--surface-2)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                activeTab === 'manual'
                  ? 'bg-[var(--accent-indigo)] text-white shadow-2xs'
                  : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)]'
              }`}>
                <Icon name="user-plus" size="xs" />
              </div>
              <div>
                <span className="block text-xs font-extrabold text-[var(--text-primary)] font-heading leading-tight">
                  Single Candidate Entry
                </span>
                <span className="block text-[11px] text-[var(--text-tertiary)] font-sans mt-0.5">
                  Step-by-step form wizard
                </span>
              </div>
            </button>

            {/* Dual Card 2: Excel Bulk Upload */}
            <button
              type="button"
              onClick={() => setActiveTab('excel')}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer select-none ${
                activeTab === 'excel'
                  ? 'border-[var(--accent-indigo)] bg-[var(--accent-indigo-dim)]/40 shadow-xs ring-1 ring-[var(--accent-indigo)]/40'
                  : 'border-[var(--border-default)] bg-[var(--surface-2)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                activeTab === 'excel'
                  ? 'bg-[var(--accent-indigo)] text-white shadow-2xs'
                  : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-default)]'
              }`}>
                <Icon name="file-spreadsheet" size="xs" />
              </div>
              <div>
                <span className="block text-xs font-extrabold text-[var(--text-primary)] font-heading leading-tight">
                  Excel Bulk Upload
                </span>
                <span className="block text-[11px] text-[var(--text-tertiary)] font-sans mt-0.5">
                  Import candidates from .xlsx
                </span>
              </div>
            </button>
          </div>
        </DialogHeader>

        {/* ── Dialog Content Surface ───────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'manual' ? (
            <ManualEntryForm
              onSuccess={handleSuccess}
              onCancel={onClose}
              uiVariant="v2"
            />
          ) : (
            <div className="p-5 h-full overflow-y-auto scrollbar-none">
              <ExcelUploadForm onSuccess={onClose} />
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};
