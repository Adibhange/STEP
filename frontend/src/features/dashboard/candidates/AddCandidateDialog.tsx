'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, EnterpriseModal } from '@/design-system';
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
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Candidate"
      subtitle="Single-candidate form wizard or high-speed Excel bulk ingestion."
      icon="user-plus"
      maxWidth="3xl"
      hideFooter
    >
      <div className="flex flex-col gap-4">
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

        {/* Stable Fluid Dialog Content Surface */}
        <div className="flex-1 min-h-0 relative">
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
      </div>
    </EnterpriseModal>
  );
};
