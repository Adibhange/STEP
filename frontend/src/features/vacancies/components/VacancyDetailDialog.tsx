'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { PipelineFlowVersions } from './PipelineFlowVersions';
import { AssessmentPatternBuilder } from './AssessmentPatternBuilder';
import { CandidateBulkFlowAssignment } from './CandidateBulkFlowAssignment';
import type { VacancyItem } from '../types/vacancy.types';

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

  if (!isOpen || !vacancy) return null;

  const isDirectHiring = vacancy.driveType === 'Direct / Sourced Hiring';
  const origin = getAppOrigin();
  const applyUrl = `${origin}/apply/${vacancy.code || vacancy.id}`;
  const dynamicQrUrl = vacancy.qrAnalytics?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(applyUrl)}`;

  const handleCopyQrUrl = () => {
    const copyTarget = vacancy.qrAnalytics?.registrationUrl || applyUrl;
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(copyTarget);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 2000);
    }
  };

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
                      <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{vacancy.experience}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Primary Hiring Location</span>
                      <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{vacancy.hiringLocation}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Test Center</span>
                      <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{vacancy.testLocation}</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  <div className="sm:col-span-4 flex flex-col items-center text-center bg-[var(--surface-1)] border border-[var(--border-default)] p-4 rounded-xl shadow-xs">
                    <img
                      src={dynamicQrUrl}
                      alt="Vacancy QR Code"
                      className="w-36 h-36 rounded-lg border border-[var(--accent-indigo)] bg-white p-1.5 shadow-2xs"
                    />
                    <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono mt-2">
                      {isDirectHiring ? 'Direct Apply Link' : 'Scan to Register'}
                    </span>
                    <div className="flex items-center gap-2 mt-3">
                      <button type="button" onClick={handleCopyQrUrl} className="px-3 h-7.5 text-[11.5px] font-bold border border-[var(--border-default)] rounded-full hover:bg-[var(--surface-hover)] cursor-pointer">
                        {qrCopied ? 'Copied!' : 'Copy Link'}
                      </button>
                      <a href={dynamicQrUrl} target="_blank" rel="noreferrer" download="vacancy_qr_poster.png" className="px-3 h-7.5 text-[11.5px] font-bold bg-[var(--accent-indigo)] text-white rounded-full flex items-center gap-1 cursor-pointer">
                        <Icon name="download" size="xs" />
                        <span>{isDirectHiring ? 'Share' : 'Poster'}</span>
                      </a>
                    </div>
                  </div>

                  <div className="sm:col-span-8 grid grid-cols-2 gap-3 text-[12px]">
                    <div className="bg-[var(--surface-1)] p-3 rounded-lg border border-[var(--border-default)]">
                      <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">
                        {isDirectHiring ? 'Portal Visits' : 'Total Scans'}
                      </span>
                      <span className="text-xl font-black font-mono text-[var(--text-primary)] block mt-0.5">{vacancy.qrAnalytics?.totalScans || 184}</span>
                    </div>
                    <div className="bg-[var(--surface-1)] p-3 rounded-lg border border-[var(--border-default)]">
                      <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">
                        {isDirectHiring ? 'Direct Applicants' : 'Registrations'}
                      </span>
                      <span className="text-xl font-black font-mono text-emerald-600 block mt-0.5">{vacancy.qrAnalytics?.successfulRegistrations || 142}</span>
                    </div>
                    <div className="bg-[var(--surface-1)] p-3 rounded-lg border border-[var(--border-default)]">
                      <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Conversion Rate</span>
                      <span className="text-xl font-black font-mono text-[var(--accent-indigo)] block mt-0.5">{vacancy.qrAnalytics?.conversionRate || 77.1}%</span>
                    </div>
                    <div className="bg-[var(--surface-1)] p-3 rounded-lg border border-[var(--border-default)]">
                      <span className="text-[10.5px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">
                        {isDirectHiring ? 'Sourced Channels' : 'Walk-in Venue'}
                      </span>
                      <span className="font-bold text-[var(--text-primary)] block mt-0.5">
                        {isDirectHiring ? 'LinkedIn, Naukri, Direct' : 'Pune Tech Park'}
                      </span>
                    </div>
                  </div>
                </div>
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
