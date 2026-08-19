'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Icon,
  elasticDialogVariant,
  dialogBackdropVariant,
  dialogContentBlossomVariant,
} from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { VacancyCandidatesTab } from './VacancyCandidatesTab';
import type { VacancyItem } from '../types/vacancy.types';
import {
  useGetVacancyByIdQuery,
  useGetQRCodeByVacancyQuery,
  useGetQRCodeAnalyticsQuery,
  useGenerateQRCodeMutation,
} from '@/store/services/api';

import { getAppOrigin } from '@/lib/utils/url-helper';

interface VacancyDetailDialogProps {
  vacancy: (VacancyItem & { driveType?: 'Walk-in Drive' | 'Direct / Sourced Hiring' }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VacancyDetailDialog: React.FC<VacancyDetailDialogProps> = ({
  vacancy,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [qrCopied, setQrCopied] = useState(false);
  const [isGenerateQrOpen, setIsGenerateQrOpen] = useState(false);
  const [genVenueName, setGenVenueName] = useState('');
  const [genDriveDate, setGenDriveDate] = useState('');

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const vacancyIdNum = Number(vacancy?.id);
  const isDirectHiring = vacancy?.driveType === 'Direct / Sourced Hiring';

  const { data: vacancyDetailRes } = useGetVacancyByIdQuery(vacancyIdNum, { skip: !vacancyIdNum || isDirectHiring });
  const vacancyDetail = vacancyDetailRes?.data;

  const { data: qrCodeRes, isLoading: isQrLoading, refetch: refetchQrCode } = useGetQRCodeByVacancyQuery(vacancyIdNum, { skip: !vacancyIdNum || isDirectHiring });
  const qrCode = qrCodeRes?.data;
  const { data: qrAnalyticsRes } = useGetQRCodeAnalyticsQuery(qrCode?.id ?? 0, { skip: !qrCode });
  const qrAnalytics = qrAnalyticsRes?.data;
  const [generateQRCodeApi, { isLoading: isGeneratingQr }] = useGenerateQRCodeMutation();

  // Cache last active vacancy so exit animation has access to data while fading out
  const lastVacancyRef = React.useRef(vacancy);
  if (vacancy) {
    lastVacancyRef.current = vacancy;
  }
  const activeVacancy = vacancy || lastVacancyRef.current;

  const origin = getAppOrigin();
  const applyUrl = `${origin}/apply/${activeVacancy?.code || activeVacancy?.id || ''}`;
  const dynamicQrUrl = qrCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode.registrationUrl)}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(applyUrl)}`;

  const handleCopyQrUrl = () => {
    const copyTarget = qrCode?.registrationUrl || applyUrl;
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(copyTarget);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2000);
      toast.success('Link Copied', { description: 'Registration URL copied to clipboard.' });
    }
  };

  const handleGenerateQrCode = async () => {
    if (!genVenueName.trim() || !genDriveDate) {
      toast.error('Missing Details', { description: 'Venue name and drive date are required to generate a QR code.' });
      return;
    }
    try {
      await generateQRCodeApi({
        vacancyId: vacancyIdNum,
        venueName: genVenueName.trim(),
        driveDate: genDriveDate,
      }).unwrap();
      await refetchQrCode();
      toast.success('QR Code Generated', { description: `Walk-in registration QR code created for "${genVenueName.trim()}".` });
      setIsGenerateQrOpen(false);
      setGenVenueName('');
      setGenDriveDate('');
    } catch (err: any) {
      toast.error('Generation Failed', { description: err?.data?.message || 'Could not generate a QR code for this vacancy.' });
    }
  };

  const candidateCount = activeVacancy?.appliedCount || 128;
  const TABS = [
    { id: 'overview', label: isDirectHiring ? 'Overview & Direct Apply' : 'Overview & QR Hub', icon: isDirectHiring ? 'file-text' : 'grid' },
    { id: 'candidates', label: `Candidates (${candidateCount})`, icon: 'users' },
  ];

  return (
    <AnimatePresence>
      {isOpen && activeVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto isolate">
          {/* Theme-Aware Ambient Backdrop with Soft Blur */}
          <motion.div
            key="backdrop"
            variants={dialogBackdropVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-xs transform-gpu"
            aria-hidden="true"
          />

          {/* Unique Next-Level Elastic Blooming Spring Modal */}
          <motion.div
            key="dialog"
            variants={elasticDialogVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ transformOrigin: '50% 40%' }}
            className="relative bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl sm:rounded-[var(--radius-xl)] shadow-[0_25px_70px_-15px_rgba(99,102,241,0.22),0_0_0_1px_rgba(255,255,255,0.06)] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden cursor-default z-10 transform-gpu my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Staggered Modal Header */}
            <motion.div
              variants={dialogContentBlossomVariant}
              initial="hidden"
              animate="show"
              className="flex flex-col border-b border-[var(--border-default)] bg-[var(--surface-1)] shrink-0"
            >
            <div className="flex items-start justify-between p-3.5 sm:p-5 pb-3 gap-3">
              <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center shrink-0 border border-[var(--accent-indigo)]/20 shadow-2xs mt-0.5">
                  <Icon name={isDirectHiring ? 'users' : 'grid'} size="sm" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-[var(--text-primary)] font-heading tracking-tight truncate max-w-[220px] sm:max-w-none">
                      {activeVacancy.title}
                    </h2>
                    <span className="font-mono text-[10px] sm:text-[11px] text-[var(--text-tertiary)] shrink-0">({activeVacancy.code})</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--accent-violet-dim)] text-[var(--accent-violet)] border border-[var(--accent-violet)]/30 font-mono whitespace-nowrap shrink-0">
                      {activeVacancy.driveType || 'Walk-in Drive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-[11.5px] text-[var(--text-tertiary)] mt-1 flex-wrap font-sans">
                    <span>{activeVacancy.role}</span>
                    <span>•</span>
                    <span>{activeVacancy.department}</span>
                    <span>•</span>
                    <span>{activeVacancy.hiringLocation}</span>
                    <span>•</span>
                    <span className="font-semibold text-[var(--text-secondary)]">{activeVacancy.openPositions} Open Positions</span>
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={onClose}
                className="w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
                title="Close modal"
              >
                <Icon name="x" size="xs" />
              </motion.button>
            </div>

            {/* Sub-Tabs Bar */}
            <div className="flex items-center gap-1 px-3 sm:px-5 bg-[var(--surface-2)]/60 border-t border-[var(--border-soft)] overflow-x-auto scrollbar-none">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-[11.5px] sm:text-[12px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'text-[var(--accent-indigo)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon name={tab.icon as any} size="xs" />
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeVacancyTabLine"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-indigo)]"
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Modal Scrollable Body */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.08 }}
            className="p-3 sm:p-5 md:p-6 overflow-y-auto scrollbar-step flex-1"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="tab-overview"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="flex flex-col gap-4 sm:gap-5"
                >
                  {/* Top 2 Cards Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
                    {/* Master Data Card */}
                    <div className="lg:col-span-2 bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl sm:rounded-[var(--radius-lg)] p-3.5 sm:p-4 flex flex-col gap-3 shadow-xs">
                      <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-2 font-heading">
                        Master Data Specifications Overview
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:text-[12.5px]">
                        <div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Recruitment Model</span>
                          <span className="font-bold text-[var(--accent-indigo)] mt-0.5 block font-mono">{activeVacancy.driveType || 'Walk-in Drive'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Job Role</span>
                          <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{activeVacancy.role}</span>
                        </div>
                        <div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Department</span>
                          <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{activeVacancy.department}</span>
                        </div>
                        <div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Experience Tier</span>
                          <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{activeVacancy.experience}</span>
                        </div>
                        <div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Primary Hiring Location</span>
                          <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{activeVacancy.hiringLocation}</span>
                        </div>
                        <div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Employment Type</span>
                          <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{activeVacancy.employmentType || 'Full-Time Permanent'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Hiring Pipeline Summary Card */}
                    <div className="bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl sm:rounded-[var(--radius-lg)] p-3.5 sm:p-4 flex flex-col justify-between shadow-xs">
                      <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-2 font-heading">
                        Hiring Pipeline Summary
                      </h3>
                      <div className="flex flex-col gap-2 my-2 text-xs sm:text-[12px]">
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">Registered Candidates</span>
                          <span className="font-mono font-bold text-[var(--text-primary)]">{candidateCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">Assessment Stage</span>
                          <span className="font-mono font-bold text-amber-400">23</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">Interviewing</span>
                          <span className="font-mono font-bold text-indigo-400">75</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">Offered</span>
                          <span className="font-mono font-bold text-emerald-400">9</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Registration Hub Card */}
                  <div className="bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl sm:rounded-[var(--radius-lg)] p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[var(--border-default)] pb-3">
                      <div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] font-heading">
                          Candidate Walk-in & QR Registration Hub
                        </h3>
                        <p className="text-[11px] sm:text-[11.5px] text-[var(--text-secondary)] mt-0.5">
                          Scan to self-register for this walk-in hiring drive
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10.5px] font-bold flex items-center gap-1 font-mono whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Walk-in QR Active
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-5 pt-1">
                      {/* Left: QR Display with smooth buttons */}
                      <div className="flex flex-col items-center gap-2.5 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-2xl p-3.5 shadow-xs w-full sm:w-auto">
                        <div className="w-34 h-34 sm:w-38 sm:h-38 bg-white p-2.5 rounded-xl shadow-xs flex items-center justify-center">
                          <img src={dynamicQrUrl} alt="Drive Registration QR" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider font-bold">
                          Scan to Register
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopyQrUrl}
                            className="h-7 px-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                          >
                            {qrCopied ? 'Copied ✓' : 'Copy Link'}
                          </button>
                          <button
                            type="button"
                            onClick={() => window.open(dynamicQrUrl, '_blank')}
                            className="h-7 px-3 rounded-lg bg-[var(--accent-indigo)] text-white text-xs font-semibold hover:bg-[var(--accent-indigo-hover)] transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <Icon name="download" size="xs" />
                            <span>Poster</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: Metrics Grid */}
                      <div className="flex-1 grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
                        <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)]">
                          <span className="text-[10px] sm:text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Total Scans</span>
                          <span className="text-base sm:text-lg font-black text-[var(--text-primary)] font-mono block mt-0.5">342</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)]">
                          <span className="text-[10px] sm:text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Registrations</span>
                          <span className="text-base sm:text-lg font-black text-emerald-400 font-mono block mt-0.5">{candidateCount}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)]">
                          <span className="text-[10px] sm:text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Conversion Rate</span>
                          <span className="text-base sm:text-lg font-black text-indigo-400 font-mono block mt-0.5">37.4%</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)]">
                          <span className="text-[10px] sm:text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Walk-in Venue</span>
                          <span className="text-xs font-bold text-[var(--text-primary)] block mt-1 truncate">Pune Assessment Hub</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: LIVE CANDIDATES ROSTER */}
              {activeTab === 'candidates' && (
                <motion.div
                  key="tab-candidates"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                >
                  <VacancyCandidatesTab vacancy={activeVacancy} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
