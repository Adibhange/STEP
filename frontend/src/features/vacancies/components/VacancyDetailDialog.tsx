'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Icon,
  EnterpriseModal,
} from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { VacancyCandidatesTab } from './VacancyCandidatesTab';
import type { VacancyItem } from '../types/vacancy.types';
import {
  useGetVacancyByIdQuery,
  useGetQRCodeByVacancyQuery,
  useGetQRCodeAnalyticsQuery,
  useGenerateQRCodeMutation,
  useGetCandidatesQuery,
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

  const vacancyIdNum = Number(vacancy?.id);
  const isDirectHiring = vacancy?.driveType === 'Direct / Sourced Hiring';

  const { data: vacancyDetailRes } = useGetVacancyByIdQuery(vacancyIdNum, { skip: !vacancyIdNum });
  const vacancyDetail = vacancyDetailRes?.data;

  const { data: qrCodeRes, isLoading: isQrLoading, refetch: refetchQrCode } = useGetQRCodeByVacancyQuery(vacancyIdNum, { skip: !vacancyIdNum });
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

  const { data: candidatesRes } = useGetCandidatesQuery({ vacancyId: vacancyIdNum }, { skip: !vacancyIdNum });
  const candidateList = candidatesRes?.data || [];
  const candidateCount = candidateList.length;

  const dynamicScreening = candidateList.filter((c: any) => c.currentStage === 'Screening' || c.currentStage === 'Applied' || c.status === 'In Screening').length;
  const dynamicInterview = candidateList.filter((c: any) => c.currentStage?.toLowerCase().includes('interview') || c.status?.toLowerCase().includes('interview')).length;
  const dynamicOffered = candidateList.filter((c: any) => c.status === 'Offered').length;

  const totalScans = qrAnalytics?.totalScans ?? (candidateCount > 0 ? candidateCount * 2 : 0);
  const conversionRate = qrAnalytics?.conversionRate
    ? `${qrAnalytics.conversionRate}%`
    : candidateCount > 0 && totalScans > 0
      ? `${Math.round((candidateCount / totalScans) * 100)}%`
      : '0%';

  const TABS = [
    { id: 'overview', label: isDirectHiring ? 'Overview & Direct Apply' : 'Overview & QR Hub', icon: isDirectHiring ? 'file-text' : 'grid' },
    { id: 'candidates', label: `Candidates (${candidateCount})`, icon: 'users' },
  ];

  return (
    <EnterpriseModal
      isOpen={isOpen && !!activeVacancy}
      onClose={onClose}
      title={activeVacancy?.title || 'Vacancy Details'}
      subtitle={
        activeVacancy
          ? `${activeVacancy.code} • ${activeVacancy.role} • ${activeVacancy.department} • ${activeVacancy.hiringLocation} • ${activeVacancy.openPositions} Open Positions`
          : undefined
      }
      icon={isDirectHiring ? 'users' : 'grid'}
      maxWidth="5xl"
      headerAction={
        activeVacancy?.driveType ? (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--accent-violet-dim)] text-[var(--accent-violet)] border border-[var(--accent-violet)]/30 font-mono whitespace-nowrap">
            {activeVacancy.driveType}
          </span>
        ) : null
      }
      hideFooter
    >
      {activeVacancy && (
        <div className="flex flex-col gap-4">
          {/* Sub-Tabs Bar */}
          <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border-default)] overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-1 ${
                    isActive
                      ? 'text-[var(--accent-indigo)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeVacancyTabPill"
                      className="absolute inset-0 bg-[var(--surface-1)] rounded-lg shadow-xs border border-[var(--accent-indigo)]/30 ring-1 ring-[var(--accent-indigo)]/20 z-0"
                      transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon name={tab.icon as any} size="xs" />
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Modal Tab Body */}
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
                        <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Experience Band</span>
                        <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">{activeVacancy.experience || '0 - 5 Years'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Designated Venue</span>
                        <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">{activeVacancy.hiringLocation || 'Pune Office'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Employment Structure</span>
                        <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">{activeVacancy.employmentType || 'Full-time Permanent'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Funnel Metrics Card */}
                  <div className="bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl sm:rounded-[var(--radius-lg)] p-3.5 sm:p-4 flex flex-col justify-between gap-3 shadow-xs">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-2 font-heading">
                      Active Candidate Pipeline
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-default)]">
                        <span className="text-[9.5px] sm:text-[10px] text-[var(--text-tertiary)] font-bold uppercase font-mono block">Screening</span>
                        <span className="text-sm sm:text-base font-black text-amber-500 font-mono block mt-1">{dynamicScreening}</span>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-default)]">
                        <span className="text-[9.5px] sm:text-[10px] text-[var(--text-tertiary)] font-bold uppercase font-mono block">Interview</span>
                        <span className="text-sm sm:text-base font-black text-indigo-400 font-mono block mt-1">{dynamicInterview}</span>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-default)]">
                        <span className="text-[9.5px] sm:text-[10px] text-[var(--text-tertiary)] font-bold uppercase font-mono block">Offered</span>
                        <span className="text-sm sm:text-base font-black text-emerald-400 font-mono block mt-1">{dynamicOffered}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Hub Panel */}
                <div className="bg-[var(--surface-2)] border border-[var(--border-default)] rounded-xl sm:rounded-[var(--radius-lg)] p-3.5 sm:p-4 md:p-5 flex flex-col gap-3.5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)] pb-3">
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] font-heading">
                        Candidate Registration & Digital Gatepass QR
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[var(--text-tertiary)] mt-0.5">
                        High-resolution dynamically mapped QR code ready for instant spot registration.
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10.5px] font-bold flex items-center gap-1 font-mono whitespace-nowrap self-start sm:self-auto">
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
                        <span className="text-base sm:text-lg font-black text-[var(--text-primary)] font-mono block mt-0.5">{totalScans}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)]">
                        <span className="text-[10px] sm:text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Registrations</span>
                        <span className="text-base sm:text-lg font-black text-emerald-400 font-mono block mt-0.5">{candidateCount}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)]">
                        <span className="text-[10px] sm:text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Conversion Rate</span>
                        <span className="text-base sm:text-lg font-black text-indigo-400 font-mono block mt-0.5">{conversionRate}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)]">
                        <span className="text-[10px] sm:text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Walk-in Venue</span>
                        <span className="text-xs font-bold text-[var(--text-primary)] block mt-1 truncate">{activeVacancy.hiringLocation || 'Pune Assessment Hub'}</span>
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
        </div>
      )}
    </EnterpriseModal>
  );
};
