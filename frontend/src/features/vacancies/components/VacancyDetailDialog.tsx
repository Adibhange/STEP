'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { toast } from '@/design-system/feedback/toast';
import { PipelineFlowVersions } from './PipelineFlowVersions';
import { AssessmentPatternBuilder } from './AssessmentPatternBuilder';
import { CandidateBulkFlowAssignment } from './CandidateBulkFlowAssignment';
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
  const [walkInEnabled, setWalkInEnabled] = useState(true);
  const [isGenerateQrOpen, setIsGenerateQrOpen] = useState(false);
  const [genVenueName, setGenVenueName] = useState('');
  const [genDriveDate, setGenDriveDate] = useState('');

  const vacancyIdNum = Number(vacancy?.id);
  const isDirectHiring = vacancy?.driveType === 'Direct / Sourced Hiring';

  // Real vacancy detail (test locations, real experience range) — the `vacancy` prop is only the
  // list-summary shape and is missing/wrong for several fields shown here.
  const { data: vacancyDetailRes } = useGetVacancyByIdQuery(vacancyIdNum, { skip: !vacancyIdNum || isDirectHiring });
  const vacancyDetail = vacancyDetailRes?.data;

  // Real QR code + its real scan/registration analytics, if one has been generated for this
  // walk-in vacancy yet.
  const { data: qrCodeRes, isLoading: isQrLoading } = useGetQRCodeByVacancyQuery(vacancyIdNum, { skip: !vacancyIdNum || isDirectHiring });
  const qrCode = qrCodeRes?.data;
  const { data: qrAnalyticsRes } = useGetQRCodeAnalyticsQuery(qrCode?.id ?? 0, { skip: !qrCode });
  const qrAnalytics = qrAnalyticsRes?.data;
  const [generateQRCodeApi, { isLoading: isGeneratingQr }] = useGenerateQRCodeMutation();

  if (!isOpen || !vacancy) return null;

  const origin = getAppOrigin();
  const applyUrl = `${origin}/apply/${vacancy.code || vacancy.id}`;
  const dynamicQrUrl = qrCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode.registrationUrl)}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(applyUrl)}`;

  const handleCopyQrUrl = () => {
    const copyTarget = qrCode?.registrationUrl || applyUrl;
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(copyTarget);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2000);
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
      toast.success('QR Code Generated', { description: `Walk-in registration QR code created for "${genVenueName.trim()}".` });
      setIsGenerateQrOpen(false);
      setGenVenueName('');
      setGenDriveDate('');
    } catch (err: any) {
      toast.error('Generation Failed', { description: err?.data?.message || 'Could not generate a QR code for this vacancy.' });
    }
  };

  const experienceTier =
    vacancyDetail?.minExperienceYears !== undefined && vacancyDetail?.maxExperienceYears !== undefined
      ? `${vacancyDetail.minExperienceYears}-${vacancyDetail.maxExperienceYears} Years`
      : vacancy.experience;
  const testLocationDisplay =
    vacancyDetail?.testLocations && vacancyDetail.testLocations.length > 0
      ? vacancyDetail.testLocations.join(', ')
      : vacancy.testLocation;

  // Dynamic Tabs based on Drive Type (Direct Hiring gets 2 tabs: Overview & Specs, Assessment Paper)
  const TABS = isDirectHiring
    ? [
        { id: 'overview', label: 'Overview & Specs', icon: 'file-text' },
        { id: 'assessment-builder', label: 'Assessment & Question Paper', icon: 'clipboard-check' },
      ]
    : [
        { id: 'overview', label: 'Overview & QR Center', icon: 'grid' },
        { id: 'flow-versions', label: 'Pipeline Flow Versions', icon: 'bar-chart-2' },
        { id: 'assessment-builder', label: 'Assessment Builder & Excel', icon: 'clipboard-check' },
        { id: 'bulk-assignment', label: 'Candidates & Bulk Flow Assignment', icon: 'users' },
      ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-[var(--shadow-2xl)] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-col border-b border-[var(--border-default)] bg-[var(--surface-1)] shrink-0">
          <div className="flex items-center justify-between p-4 sm:p-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center shrink-0 border border-[var(--accent-indigo)]/20 shadow-2xs">
                <Icon name={isDirectHiring ? 'users' : 'grid'} size="md" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
                    {vacancy.title}
                  </h2>
                  <span className="font-mono text-[11px] text-[var(--text-tertiary)]">({vacancy.code})</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                    {vacancy.driveType || 'Walk-in Drive'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-[var(--text-tertiary)] mt-0.5 flex-wrap font-sans">
                  <span>{vacancy.role}</span>
                  <span>•</span>
                  <span>{vacancy.department}</span>
                  <span>•</span>
                  <span>{vacancy.hiringLocation}</span>
                  <span>•</span>
                  <span className="font-semibold text-[var(--text-secondary)]">{vacancy.openPositions} Open Positions</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
              title="Close modal"
            >
              <Icon name="x" size="xs" />
            </button>
          </div>

          {/* Sub-Tabs Bar */}
          <div className="flex items-center gap-1.5 px-4 sm:px-5 bg-[var(--surface-2)]/60 border-t border-[var(--border-soft)] overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-[12px] font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-[var(--accent-indigo)] text-[var(--accent-indigo)] bg-[var(--surface-1)] shadow-2xs'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <Icon name={tab.icon as any} size="xs" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto scrollbar-step flex-1 space-y-5">
          {/* TAB 1: OVERVIEW & SPECS (SAME UI STRUCTURE FOR BOTH WALK-IN AND DIRECT HIRING) */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-[var(--surface-2)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4 flex flex-col gap-3">
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-2 font-heading">
                    Master Data Specifications Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                    <div>
                      <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Recruitment Model</span>
                      <span className="font-bold text-[var(--accent-indigo)] mt-0.5 block font-mono">{vacancy.driveType || 'Walk-in Drive'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Job Role</span>
                      <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{vacancy.role}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Department</span>
                      <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{vacancy.department}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Experience Tier</span>
                      <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{experienceTier}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Primary Hiring Location</span>
                      <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{vacancy.hiringLocation}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Test Center</span>
                      <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{testLocationDisplay}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--surface-2)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4 flex flex-col gap-3">
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-2 font-heading">
                    Hiring Pipeline Summary
                  </h3>
                  <div className="space-y-2.5 text-[12px]">
                    <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)] font-medium">Applied</span><span className="font-mono font-bold text-[var(--text-primary)]">{vacancy.appliedCount}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)] font-medium">Screened / Assessment</span><span className="font-mono font-bold text-[var(--text-primary)]">{vacancy.assessmentCount}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)] font-medium">Interviewing</span><span className="font-mono font-bold text-[var(--text-primary)]">{vacancy.interviewCount}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)] font-medium">Offered</span><span className="font-mono font-bold text-emerald-600">{vacancy.offeredCount}</span></div>
                  </div>
                </div>
              </div>

              {/* UNIFIED HUB CARD (SAME EXACT UI CARD STRUCTURE FOR BOTH WALK-IN AND DIRECT HIRING) */}
              <div className="bg-[var(--surface-2)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading">
                      {isDirectHiring ? 'Direct Applicant & Sourced Portal Hub' : 'Candidate Walk-in & QR Registration Hub'}
                    </h3>
                    <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                      {isDirectHiring ? 'Sourced portal apply link & direct candidate channel analytics' : 'Scan to self-register for this walk-in hiring drive'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWalkInEnabled(!walkInEnabled)}
                    className={`px-3 py-1 rounded-full text-[11.5px] font-bold cursor-pointer transition-all ${
                      walkInEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[var(--surface-3)] text-[var(--text-tertiary)]'
                    }`}
                  >
                    {walkInEnabled ? (isDirectHiring ? '✓ Apply Link Active' : '✓ Walk-in QR Active') : 'Link Paused'}
                  </button>
                </div>

                {/* Direct Hiring has no real backend-tracked portal analytics yet — left as an
                    illustrative placeholder, unlike the walk-in QR path below which is now real. */}
                {isDirectHiring ? (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    <div className="sm:col-span-4 flex flex-col items-center text-center bg-[var(--surface-1)] border border-[var(--border-default)] p-4 rounded-xl shadow-xs">
                      <img src={dynamicQrUrl} alt="Vacancy Apply Link" className="w-36 h-36 rounded-lg border border-[var(--accent-indigo)] bg-white p-1.5 shadow-2xs" />
                      <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono mt-2">Direct Apply Link</span>
                      <div className="flex items-center gap-2 mt-3">
                        <button type="button" onClick={handleCopyQrUrl} className="px-3 h-7.5 text-[11.5px] font-bold border border-[var(--border-default)] rounded-full hover:bg-[var(--surface-hover)] cursor-pointer">
                          {qrCopied ? 'Copied!' : 'Copy Link'}
                        </button>
                        <a href={dynamicQrUrl} target="_blank" rel="noreferrer" download="vacancy_qr_poster.png" className="px-3 h-7.5 text-[11.5px] font-bold bg-[var(--accent-indigo)] text-white rounded-full flex items-center gap-1 cursor-pointer">
                          <Icon name="download" size="xs" />
                          <span>Share</span>
                        </a>
                      </div>
                    </div>
                    <div className="sm:col-span-8 grid grid-cols-2 gap-3 text-[12px]">
                      <div className="bg-[var(--surface-1)] p-3 rounded-lg border border-[var(--border-default)]">
                        <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Portal Visits</span>
                        <span className="text-xl font-black font-mono text-[var(--text-tertiary)] block mt-0.5">—</span>
                      </div>
                      <div className="bg-[var(--surface-1)] p-3 rounded-lg border border-[var(--border-default)]">
                        <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Direct Applicants</span>
                        <span className="text-xl font-black font-mono text-[var(--text-tertiary)] block mt-0.5">{vacancy.appliedCount}</span>
                      </div>
                      <div className="bg-[var(--surface-1)] p-3 rounded-lg border border-[var(--border-default)] col-span-2">
                        <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Sourced Channels</span>
                        <span className="text-[11px] text-[var(--text-tertiary)] block mt-0.5">Not tracked yet — no channel-attribution data source is wired up.</span>
                      </div>
                    </div>
                  </div>
                ) : isQrLoading ? (
                  <div className="p-6 text-center text-[12px] text-[var(--text-tertiary)] font-semibold flex items-center justify-center gap-2">
                    <Icon name="spinner" size="xs" className="animate-spin" />
                    <span>Loading QR code…</span>
                  </div>
                ) : qrCode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    <div className="sm:col-span-4 flex flex-col items-center text-center bg-[var(--surface-1)] border border-[var(--border-default)] p-4 rounded-xl shadow-xs">
                      <img src={dynamicQrUrl} alt="Vacancy QR Code" className="w-36 h-36 rounded-lg border border-[var(--accent-indigo)] bg-white p-1.5 shadow-2xs" />
                      <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono mt-2">Scan to Register</span>
                      <div className="flex items-center gap-2 mt-3">
                        <button type="button" onClick={handleCopyQrUrl} className="px-3 h-7.5 text-[11.5px] font-bold border border-[var(--border-default)] rounded-full hover:bg-[var(--surface-hover)] cursor-pointer">
                          {qrCopied ? 'Copied!' : 'Copy Link'}
                        </button>
                        <a href={dynamicQrUrl} target="_blank" rel="noreferrer" download="vacancy_qr_poster.png" className="px-3 h-7.5 text-[11.5px] font-bold bg-[var(--accent-indigo)] text-white rounded-full flex items-center gap-1 cursor-pointer">
                          <Icon name="download" size="xs" />
                          <span>Poster</span>
                        </a>
                      </div>
                    </div>

                    <div className="sm:col-span-8 grid grid-cols-2 gap-3 text-[12px]">
                      <div className="bg-[var(--surface-1)] p-3 rounded-lg border border-[var(--border-default)]">
                        <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Total Scans</span>
                        <span className="text-xl font-black font-mono text-[var(--text-primary)] block mt-0.5">{qrAnalytics?.totalScans ?? 0}</span>
                      </div>
                      <div className="bg-[var(--surface-1)] p-3 rounded-lg border border-[var(--border-default)]">
                        <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Registrations</span>
                        <span className="text-xl font-black font-mono text-emerald-600 block mt-0.5">{qrAnalytics?.successfulRegistrations ?? 0}</span>
                      </div>
                      <div className="bg-[var(--surface-1)] p-3 rounded-lg border border-[var(--border-default)]">
                        <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Conversion Rate</span>
                        <span className="text-xl font-black font-mono text-[var(--accent-indigo)] block mt-0.5">{qrAnalytics?.conversionRate ?? 0}%</span>
                      </div>
                      <div className="bg-[var(--surface-1)] p-3 rounded-lg border border-[var(--border-default)]">
                        <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Walk-in Venue</span>
                        <span className="font-bold text-[var(--text-primary)] block mt-0.5">{qrCode.venueName}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <Icon name="alert-triangle" size="md" className="text-amber-500" />
                    <p className="text-[12.5px] text-[var(--text-tertiary)] font-semibold">
                      No QR code has been generated for this vacancy yet.
                    </p>
                    {!isGenerateQrOpen ? (
                      <button
                        type="button"
                        onClick={() => setIsGenerateQrOpen(true)}
                        className="px-4 h-9 rounded-full bg-[var(--accent-indigo)] text-white text-[12px] font-bold shadow-xs hover:bg-[var(--accent-indigo-hover)] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Icon name="plus" size="xs" />
                        <span>Generate QR Code</span>
                      </button>
                    ) : (
                      <div className="w-full max-w-sm flex flex-col gap-2.5 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-xl p-4 text-left">
                        <div>
                          <label className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-1">Venue Name</label>
                          <input
                            type="text"
                            value={genVenueName}
                            onChange={(e) => setGenVenueName(e.target.value)}
                            placeholder="e.g. Pune Tech Park"
                            className="w-full h-9 px-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] text-[12px] text-[var(--text-primary)] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block mb-1">Drive Date</label>
                          <input
                            type="date"
                            value={genDriveDate}
                            onChange={(e) => setGenDriveDate(e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-2)] text-[12px] text-[var(--text-primary)] outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button type="button" onClick={() => setIsGenerateQrOpen(false)} className="h-8 px-3 rounded-lg text-[11.5px] font-bold border border-[var(--border-default)] hover:bg-[var(--surface-hover)] cursor-pointer">
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleGenerateQrCode}
                            disabled={isGeneratingQr}
                            className="h-8 px-3 rounded-lg text-[11.5px] font-bold bg-[var(--accent-indigo)] text-white hover:bg-[var(--accent-indigo-hover)] cursor-pointer disabled:opacity-60"
                          >
                            {isGeneratingQr ? 'Generating…' : 'Generate'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PIPELINE FLOW VERSIONS (Walk-in Drive only) */}
          {!isDirectHiring && activeTab === 'flow-versions' && <PipelineFlowVersions vacancyId={vacancy.id} />}

          {/* ASSESSMENT BUILDER & EXCEL (Both Walk-in Drive & Direct Hiring) */}
          {activeTab === 'assessment-builder' && <AssessmentPatternBuilder vacancyId={Number(vacancy.id)} />}

          {/* CANDIDATES & BULK FLOW ASSIGNMENT (Walk-in Drive & Direct Hiring) */}
          {activeTab === 'bulk-assignment' && (
            <CandidateBulkFlowAssignment vacancyId={vacancy.id} vacancyTitle={vacancy.title} />
          )}
        </div>
      </div>
    </div>
  );
};
