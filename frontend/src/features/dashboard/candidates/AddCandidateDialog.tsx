'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Icon,
} from '@/design-system';
import { ManualEntryForm } from './components/ManualEntryForm';
import { ExcelUploadForm } from './components/ExcelUploadForm';
import type { DashboardCandidate } from '@/features/dashboard/types/dashboard.types';

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
      <DialogContent className="w-[92vw] sm:w-[65vw] sm:max-w-[960px] sm:min-w-[720px] h-[88vh] max-h-[780px] min-h-[580px] flex flex-col p-0 border border-[var(--border-default)] shadow-[var(--shadow-2xl)] rounded-2xl bg-[var(--surface-1)] overflow-hidden animate-step-modal-elastic">

        {/* ── Dialog Header with V2 Engine Badge & Segmented Method Selector ── */}
        <DialogHeader className="px-5 sm:px-7 pt-4 sm:pt-5 pb-3 sm:pb-3.5 border-b border-[var(--border-default)] mb-0 shrink-0 bg-[var(--surface-1)]">
          {/* Top Title & Close Row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-indigo)]/20 to-[var(--accent-indigo)]/5 text-[var(--accent-indigo)] flex items-center justify-center shrink-0 border border-[var(--accent-indigo)]/30 shadow-2xs">
                <Icon name="user-plus" size="sm" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] font-heading tracking-tight leading-none">
                  Add Candidate
                </DialogTitle>
                <p className="text-xs text-[var(--text-tertiary)] font-sans mt-1">
                  Single-candidate form wizard or high-speed Excel bulk ingestion.
                </p>
              </div>
            </div>

            {/* Custom Close Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0 border border-transparent hover:border-[var(--border-default)]"
              aria-label="Close dialog"
            >
              <Icon name="x" size="xs" />
            </motion.button>
          </div>

          {/* Segmented Mode Selector Bar with Animated Sliding Indicator */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] gap-1 relative">
            {/* Mode 1: Single Candidate Direct Entry */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`relative h-10 px-3 rounded-lg text-left flex items-center justify-center gap-2.5 transition-colors cursor-pointer select-none font-sans z-10 ${
                activeTab === 'manual'
                  ? 'text-[var(--accent-indigo)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
              }`}
            >
              {activeTab === 'manual' && (
                <motion.div
                  layoutId="activeAddModePill"
                  transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                  className="absolute inset-0 bg-[var(--surface-1)] rounded-lg shadow-xs border border-[var(--accent-indigo)]/30 ring-1 ring-[var(--accent-indigo)]/20 z-[-1]"
                />
              )}
              <Icon name="user-plus" size="xs" className={activeTab === 'manual' ? 'text-[var(--accent-indigo)]' : 'text-[var(--text-tertiary)]'} />
              <span className="text-xs sm:text-[13px]">Single Candidate Entry</span>
              <span className="hidden sm:inline text-[10.5px] text-[var(--text-tertiary)] font-mono">(Direct Form)</span>
            </motion.button>

            {/* Mode 2: Excel Bulk Upload */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setActiveTab('excel')}
              className={`relative h-10 px-3 rounded-lg text-left flex items-center justify-center gap-2.5 transition-colors cursor-pointer select-none font-sans z-10 ${
                activeTab === 'excel'
                  ? 'text-[var(--accent-indigo)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
              }`}
            >
              {activeTab === 'excel' && (
                <motion.div
                  layoutId="activeAddModePill"
                  transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                  className="absolute inset-0 bg-[var(--surface-1)] rounded-lg shadow-xs border border-[var(--accent-indigo)]/30 ring-1 ring-[var(--accent-indigo)]/20 z-[-1]"
                />
              )}
              <Icon name="file-spreadsheet" size="xs" className={activeTab === 'excel' ? 'text-emerald-500' : 'text-[var(--text-tertiary)]'} />
              <span className="text-xs sm:text-[13px]">Excel Bulk Upload</span>
              <span className="hidden sm:inline text-[10.5px] text-[var(--text-tertiary)] font-mono">(.xlsx / .csv)</span>
            </motion.button>
          </div>
        </DialogHeader>

        {/* ── Stable Fluid Dialog Content Surface ───────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'manual' ? (
              <motion.div
                key="manual-tab-view"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="h-full flex flex-col min-h-0"
              >
                <ManualEntryForm
                  onSuccess={handleSuccess}
                  onCancel={onClose}
                  uiVariant="v2"
                />
              </motion.div>
            ) : (
              <motion.div
                key="excel-tab-view"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="h-full flex flex-col min-h-0"
              >
                <ExcelUploadForm
                  onSuccess={onClose}
                  onCancel={onClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </DialogContent>
    </Dialog>
  );
};
