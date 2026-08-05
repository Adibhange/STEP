'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/design-system';
import { WorkspaceHeader, type WorkspaceHeaderTab } from '@/features/shared/workspace-header/WorkspaceHeader';
import { PipelineFlowVersions } from './PipelineFlowVersions';
import { AssessmentPatternBuilder } from './AssessmentPatternBuilder';
import { CandidateBulkFlowAssignment } from './CandidateBulkFlowAssignment';
import type { VacancyItem } from '../types/vacancy.types';

interface VacancyWorkspaceProps {
  vacancy: VacancyItem;
}

const TABS: WorkspaceHeaderTab[] = [
  { id: 'overview', label: 'Overview & QR Center', icon: 'grid', badge: 'Flagship' },
  { id: 'flow-versions', label: 'Pipeline Flow Versions', icon: 'bar-chart-2' },
  { id: 'assessment-builder', label: 'Assessment Builder & Excel', icon: 'clipboard-check' },
  { id: 'bulk-assignment', label: 'Candidates & Bulk Flow Assignment', icon: 'users', badge: 142 },
];

/**
 * STEP Enterprise Vacancy Workspace — Primary Hiring Hub Workspace
 */
import { getAppOrigin } from '@/lib/utils/url-helper';

export const VacancyWorkspace: React.FC<VacancyWorkspaceProps> = ({ vacancy }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [qrCopied, setQrCopied] = useState(false);
  const [walkInEnabled, setWalkInEnabled] = useState(vacancy.walkInDrive?.enabled ?? true);

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

  const statusVariantMap = {
    Open: 'success' as const,
    Draft: 'neutral' as const,
    Paused: 'warning' as const,
    Closed: 'danger' as const,
    Archived: 'neutral' as const,
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* Reusable WorkspaceHeader */}
      <WorkspaceHeader
        title={vacancy.title}
        status={vacancy.status}
        statusVariant={statusVariantMap[vacancy.status]}
        onBack={() => router.push('/dashboard/vacancies')}
        backLabel="Back to Vacancies"
        metadata={[
          { label: 'Code', value: vacancy.code },
          { label: 'Role', value: vacancy.role, icon: 'briefcase' },
          { label: 'Hiring Location', value: vacancy.hiringLocation, icon: 'building' },
          { label: 'Experience Tier', value: vacancy.experience, icon: 'bar-chart-2' },
          { label: 'Open Positions', value: `${vacancy.openPositions} Positions` },
        ]}
        actions={
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className="h-8.5 px-4 flex items-center gap-1.5 rounded-full bg-[var(--accent-indigo)] text-[var(--text-on-accent)] text-[12px] font-bold hover:bg-[var(--accent-indigo-hover)] cursor-pointer shadow-2xs"
          >
            <Icon name="grid" size="xs" />
            <span>QR Code Registration</span>
          </button>
        }
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Primary Tab Content Panels */}
      <main className="px-4 sm:px-6">
        {/* 1. OVERVIEW & LIVE QR CENTER TAB */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            {/* Vacancy Master Data Specification Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-4 shadow-2xs">
                <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
                  Master Data Specifications Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Job Role (Master Data)</span>
                    <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{vacancy.role}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Department (Master Data)</span>
                    <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{vacancy.department}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Experience Tier (Master Data)</span>
                    <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{vacancy.experience}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Employment Type (Master Data)</span>
                    <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{vacancy.employmentType}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Primary Hiring Location (Master Data)</span>
                    <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{vacancy.hiringLocation}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono block">Test Center (Master Data)</span>
                    <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{vacancy.testLocation}</span>
                  </div>
                </div>
              </div>

              {/* Pipeline Summary Card */}
              <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-4 shadow-2xs">
                <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
                  Hiring Pipeline Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[12.5px]">
                    <span className="text-[var(--text-secondary)] font-medium">Applied Candidates</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">{vacancy.appliedCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12.5px]">
                    <span className="text-[var(--text-secondary)] font-medium">Screened / Assessment</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">{vacancy.assessmentCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12.5px]">
                    <span className="text-[var(--text-secondary)] font-medium">In Interview</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">{vacancy.interviewCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12.5px]">
                    <span className="text-[var(--text-secondary)] font-medium">Offers Released</span>
                    <span className="font-mono font-bold text-[var(--status-info-text)]">{vacancy.offeredCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12.5px] pt-2 border-t border-[var(--border-default)]">
                    <span className="font-bold text-[var(--text-primary)]">Total Hired / Joined</span>
                    <span className="font-mono font-black text-[var(--status-success-text)] text-base">{vacancy.joinedCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live QR Code Generator & Walk-in Section */}
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] font-heading">Candidate Walk-in & QR Registration Hub</h3>
                    <span className="text-[10px] font-bold bg-[var(--accent-indigo)] text-white px-2.5 py-0.5 rounded-full uppercase font-mono">
                      Active QR Generator
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[var(--text-tertiary)] mt-1">
                    On-site walk-in candidates scan this QR code on mobile to fill their details and get assigned to an interview flow version.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setWalkInEnabled(!walkInEnabled)}
                  className={`px-3.5 h-8.5 rounded-full text-[12px] font-bold cursor-pointer transition-all ${
                    walkInEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border border-[var(--border-default)]'
                  }`}
                >
                  {walkInEnabled ? '✓ Walk-in QR Active' : 'Walk-in QR Paused'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* QR Code Poster Preview */}
                <div className="lg:col-span-4 bg-[var(--surface-2)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col items-center justify-center text-center shadow-xs">
                  <img
                    src={dynamicQrUrl}
                    alt="Registration QR Code"
                    className="w-48 h-48 rounded-lg border-2 border-[var(--accent-indigo)] shadow-sm bg-white p-2"
                  />
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono mt-3">Scan to Self-Register</span>
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleCopyQrUrl}
                      className="px-3.5 h-8 text-[12px] font-bold border border-[var(--border-default)] bg-[var(--surface-1)] rounded-full hover:bg-[var(--surface-hover)] cursor-pointer"
                    >
                      {qrCopied ? 'Copied URL!' : 'Copy Link'}
                    </button>
                    <a
                      href={dynamicQrUrl}
                      target="_blank"
                      rel="noreferrer"
                      download="vacancy-qr-poster.png"
                      className="px-3.5 h-8 text-[12px] font-bold bg-[var(--accent-indigo)] text-[var(--text-on-accent)] rounded-full hover:bg-[var(--accent-indigo-hover)] cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Icon name="download" size="xs" />
                      Download Poster
                    </a>
                  </div>
                </div>

                {/* QR Scans Analytics Dashboard */}
                <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-[var(--surface-2)] p-4 rounded-[var(--radius-md)] border border-[var(--border-default)]">
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Total QR Scans</span>
                    <span className="text-2xl font-black text-[var(--text-primary)] font-mono block mt-1">{vacancy.qrAnalytics?.totalScans || 184}</span>
                  </div>
                  <div className="bg-[var(--surface-2)] p-4 rounded-[var(--radius-md)] border border-[var(--border-default)]">
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Completed Forms</span>
                    <span className="text-2xl font-black text-emerald-600 font-mono block mt-1">{vacancy.qrAnalytics?.successfulRegistrations || 142}</span>
                  </div>
                  <div className="bg-[var(--surface-2)] p-4 rounded-[var(--radius-md)] border border-[var(--border-default)]">
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Conversion Rate</span>
                    <span className="text-2xl font-black text-[var(--accent-indigo)] font-mono block mt-1">{vacancy.qrAnalytics?.conversionRate || 77.1}%</span>
                  </div>
                  <div className="bg-[var(--surface-2)] p-4 rounded-[var(--radius-md)] border border-[var(--border-default)]">
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Walk-in Venue</span>
                    <span className="text-sm font-bold text-[var(--text-primary)] block mt-1">Pune Tech Park Tower A</span>
                  </div>
                  <div className="bg-[var(--surface-2)] p-4 rounded-[var(--radius-md)] border border-[var(--border-default)] col-span-2">
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Live Scanner Stream Activity</span>
                    <span className="text-sm font-bold text-[var(--text-primary)] block mt-1">10 mins ago (Aarav Sharma scanned)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PIPELINE FLOW VERSIONS TAB */}
        {activeTab === 'flow-versions' && <PipelineFlowVersions vacancyId={vacancy.id} />}

        {/* 3. ASSESSMENT BUILDER & EXCEL TAB */}
        {activeTab === 'assessment-builder' && <AssessmentPatternBuilder />}

        {/* 4. CANDIDATES & BULK FLOW ASSIGNMENT TAB */}
        {activeTab === 'bulk-assignment' && <CandidateBulkFlowAssignment vacancyId={vacancy.id} vacancyTitle={vacancy.title} />}
      </main>
    </div>
  );
};
