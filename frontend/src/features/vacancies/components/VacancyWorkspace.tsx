'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/design-system';
import { WorkspaceHeader, type WorkspaceHeaderTab } from '@/features/shared/workspace-header/WorkspaceHeader';
import { CandidateWorkspace } from '@/features/dashboard/candidates/CandidateWorkspace';
import { ActivityFeed } from '@/features/shared/activity-feed/ActivityFeed';
import type { VacancyItem } from '@/mock/vacancies';

interface VacancyWorkspaceProps {
  vacancy: VacancyItem;
}

const TABS: WorkspaceHeaderTab[] = [
  { id: 'overview', label: 'Overview', icon: 'file-text' },
  { id: 'pipeline', label: 'Pipeline', icon: 'bar-chart-2' },
  { id: 'candidates', label: 'Candidates', icon: 'users', badge: 500 },
  { id: 'question-paper', label: 'Question Paper', icon: 'clipboard-check' },
  { id: 'walk-in-drive', label: 'Walk-in Drive', icon: 'building' },
  { id: 'qr-registration', label: 'QR Registration', icon: 'grid', badge: 'Flagship' },
  { id: 'interview-schedule', label: 'Interview Schedule', icon: 'calendar' },
  { id: 'documents', label: 'Documents', icon: 'file-text' },
  { id: 'activity', label: 'Activity', icon: 'list' },
];

/**
 * STEP Enterprise VacancyWorkspace — Complete Hiring Workspace
 */
export const VacancyWorkspace: React.FC<VacancyWorkspaceProps> = ({ vacancy }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [qrCopied, setQrCopied] = useState(false);
  const [walkInEnabled, setWalkInEnabled] = useState(vacancy.walkInDrive?.enabled ?? false);

  const handleCopyQrUrl = () => {
    if (vacancy.qrAnalytics?.registrationUrl) {
      navigator.clipboard.writeText(vacancy.qrAnalytics.registrationUrl);
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
      {/* Reusable WorkspaceHeader Primitive */}
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
          { label: 'Experience', value: vacancy.experience, icon: 'bar-chart-2' },
          { label: 'Open Positions', value: `${vacancy.openPositions} Positions` },
        ]}
        actions={
          <>
            <button
              type="button"
              onClick={() => setActiveTab('qr-registration')}
              className="h-8.5 px-3.5 flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-1)] text-[12px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] cursor-pointer shadow-2xs"
            >
              <Icon name="grid" size="xs" className="text-[var(--accent-indigo)]" />
              <span>QR Registration</span>
            </button>
            <button
              type="button"
              className="h-8.5 px-4 flex items-center gap-1.5 rounded-full bg-[var(--accent-indigo)] text-[var(--text-on-accent)] text-[12px] font-bold hover:bg-[var(--accent-indigo-hover)] cursor-pointer shadow-2xs"
            >
              <Icon name="pencil" size="xs" />
              <span>Edit Vacancy</span>
            </button>
          </>
        }
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content Panels */}
      <main className="px-4 sm:px-6">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-4 shadow-2xs">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
                Vacancy Specification Overview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Department</span>
                  <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">{vacancy.department}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Employment Type</span>
                  <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">{vacancy.employmentType}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Test Location</span>
                  <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">{vacancy.testLocation}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Work Mode</span>
                  <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">{vacancy.workMode}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Assigned Recruiter</span>
                  <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">{vacancy.assignedRecruiter}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Hiring Manager</span>
                  <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">{vacancy.hiringManager}</span>
                </div>
              </div>
            </div>

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
        )}

        {/* 2. PIPELINE TAB */}
        {activeTab === 'pipeline' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-6 shadow-2xs">
            <div>
              <h3 className="text-lg font-extrabold text-[var(--text-primary)] font-heading">Visual Recruitment Funnel</h3>
              <p className="text-[12.5px] text-[var(--text-tertiary)] mt-0.5">Stage breakdown for {vacancy.title}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { stage: 'Applied', count: vacancy.appliedCount, pct: '100%', color: 'var(--accent-indigo)' },
                { stage: 'Assessment', count: vacancy.assessmentCount, pct: `${Math.round((vacancy.assessmentCount / vacancy.appliedCount) * 100)}%`, color: 'var(--accent-cyan)' },
                { stage: 'Interview', count: vacancy.interviewCount, pct: `${Math.round((vacancy.interviewCount / vacancy.appliedCount) * 100)}%`, color: 'var(--accent-violet)' },
                { stage: 'Offered', count: vacancy.offeredCount, pct: `${Math.round((vacancy.offeredCount / vacancy.appliedCount) * 100)}%`, color: 'var(--status-info)' },
                { stage: 'Joined', count: vacancy.joinedCount, pct: `${Math.round((vacancy.joinedCount / vacancy.appliedCount) * 100)}%`, color: 'var(--status-success)' },
              ].map((item, i) => (
                <div key={item.stage} className="bg-[var(--surface-2)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-4 flex flex-col justify-between h-32 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: item.color }} />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Stage 0{i + 1}</span>
                    <span className="text-[11px] font-bold text-[var(--text-secondary)] font-mono">{item.pct}</span>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[var(--text-primary)] font-heading">{item.stage}</h4>
                    <span className="text-2xl font-black font-mono text-[var(--text-primary)] block mt-0.5">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CANDIDATES TAB */}
        {activeTab === 'candidates' && <CandidateWorkspace />}

        {/* 4. QUESTION PAPER TAB */}
        {activeTab === 'question-paper' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4 shadow-2xs">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
              Assigned Question Paper
            </h3>
            <div className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border-default)] p-4 rounded-[var(--radius-md)]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo)] flex items-center justify-center font-bold">
                  <Icon name="file-text" size="md" />
                </span>
                <div>
                  <h4 className="text-[14px] font-bold text-[var(--text-primary)]">{vacancy.questionPaperTitle}</h4>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5 font-mono">Duration: {vacancy.assessmentDurationMinutes} Mins | Passing Criteria: {vacancy.passingCriteriaPercentage}%</p>
                </div>
              </div>
              <button type="button" className="px-3 h-8 text-[12px] font-bold border border-[var(--border-default)] rounded-full hover:bg-[var(--surface-hover)] cursor-pointer">
                Change Paper
              </button>
            </div>
          </div>
        )}

        {/* 5. WALK-IN DRIVE TAB */}
        {activeTab === 'walk-in-drive' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] font-heading">Walk-in Drive Configuration</h3>
                <p className="text-[12px] text-[var(--text-tertiary)]">Walk-in event schedule and venue details for this vacancy.</p>
              </div>
              <button
                type="button"
                onClick={() => setWalkInEnabled((v) => !v)}
                className={`px-3 h-8 rounded-full text-[12px] font-bold cursor-pointer transition-all ${
                  walkInEnabled
                    ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success)]'
                    : 'bg-[var(--surface-3)] text-[var(--text-tertiary)] border border-[var(--border-default)]'
                }`}
              >
                {walkInEnabled ? 'Walk-in Drive Active' : 'Walk-in Drive Disabled'}
              </button>
            </div>

            {vacancy.walkInDrive && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                <div className="bg-[var(--surface-2)] p-4 rounded-md border border-[var(--border-default)]">
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Drive Name</span>
                  <span className="font-bold text-[var(--text-primary)] text-sm block mt-1">{vacancy.walkInDrive.name}</span>
                </div>
                <div className="bg-[var(--surface-2)] p-4 rounded-md border border-[var(--border-default)]">
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Venue</span>
                  <span className="font-bold text-[var(--text-primary)] text-sm block mt-1">{vacancy.walkInDrive.venue}</span>
                </div>
                <div className="bg-[var(--surface-2)] p-4 rounded-md border border-[var(--border-default)]">
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Date & Time</span>
                  <span className="font-bold text-[var(--text-primary)] text-sm block mt-1">{vacancy.walkInDrive.date} ({vacancy.walkInDrive.time})</span>
                </div>
                <div className="bg-[var(--surface-2)] p-4 rounded-md border border-[var(--border-default)]">
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Capacity & Deadline</span>
                  <span className="font-bold text-[var(--text-primary)] text-sm block mt-1">{vacancy.walkInDrive.capacity} Candidates (Deadline: {vacancy.walkInDrive.registrationDeadline})</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. QR REGISTRATION TAB — STEP FLAGSHIP FEATURE */}
        {activeTab === 'qr-registration' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-[var(--text-primary)] font-heading">QR Code Registration Hub</h3>
                  <span className="text-[10px] font-bold bg-[var(--accent-indigo)] text-white px-2 py-0.5 rounded-full uppercase font-mono">
                    STEP Flagship
                  </span>
                </div>
                <p className="text-[12.5px] text-[var(--text-tertiary)] mt-1">
                  On-site candidates scan this QR code to instantly register, auto-assign assessments, and land in the Dashboard workspace.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 bg-[var(--surface-2)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col items-center justify-center text-center shadow-xs">
                {vacancy.qrAnalytics?.qrCodeUrl ? (
                  <img
                    src={vacancy.qrAnalytics.qrCodeUrl}
                    alt="Registration QR Code"
                    className="w-48 h-48 rounded-lg border-2 border-[var(--accent-indigo)] shadow-sm bg-white p-2"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center font-mono">No QR Generated</div>
                )}
                <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono mt-3">Scan to Register</span>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleCopyQrUrl}
                    className="px-3 h-8 text-[12px] font-bold border border-[var(--border-default)] bg-[var(--surface-1)] rounded-full hover:bg-[var(--surface-hover)] cursor-pointer"
                  >
                    {qrCopied ? 'Copied!' : 'Copy URL'}
                  </button>
                  <a
                    href={vacancy.qrAnalytics?.qrCodeUrl}
                    target="_blank"
                    download="vacancy-qr.png"
                    className="px-3 h-8 text-[12px] font-bold bg-[var(--accent-indigo)] text-white rounded-full flex items-center gap-1 cursor-pointer"
                  >
                    <Icon name="download" size="xs" />
                    Download QR
                  </a>
                </div>
              </div>

              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--surface-2)] p-4 rounded-[var(--radius-md)] border border-[var(--border-default)]">
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Total Scans</span>
                  <span className="text-2xl font-black text-[var(--text-primary)] font-mono block mt-1">{vacancy.qrAnalytics?.totalScans}</span>
                </div>
                <div className="bg-[var(--surface-2)] p-4 rounded-[var(--radius-md)] border border-[var(--border-default)]">
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Registrations</span>
                  <span className="text-2xl font-black text-[var(--status-success-text)] font-mono block mt-1">{vacancy.qrAnalytics?.successfulRegistrations}</span>
                </div>
                <div className="bg-[var(--surface-2)] p-4 rounded-[var(--radius-md)] border border-[var(--border-default)]">
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Conversion Rate</span>
                  <span className="text-2xl font-black text-[var(--accent-indigo)] font-mono block mt-1">{vacancy.qrAnalytics?.conversionRate}%</span>
                </div>
                <div className="bg-[var(--surface-2)] p-4 rounded-[var(--radius-md)] border border-[var(--border-default)]">
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Expired Scans</span>
                  <span className="text-2xl font-black text-[var(--status-danger-text)] font-mono block mt-1">{vacancy.qrAnalytics?.expiredRegistrations}</span>
                </div>
                <div className="bg-[var(--surface-2)] p-4 rounded-[var(--radius-md)] border border-[var(--border-default)] col-span-2">
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Last Scan Activity</span>
                  <span className="text-sm font-bold text-[var(--text-primary)] block mt-1">{vacancy.qrAnalytics?.lastScanTime} (Live Tracking)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. INTERVIEW SCHEDULE TAB */}
        {activeTab === 'interview-schedule' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4 shadow-2xs">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
              Vacancy Interview Schedule & Slots
            </h3>
            <p className="text-[12.5px] text-[var(--text-tertiary)]">7 Interviews scheduled today for {vacancy.title}.</p>
          </div>
        )}

        {/* 8. DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4 shadow-2xs">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
              Vacancy Document Repository
            </h3>
            <p className="text-[12.5px] text-[var(--text-tertiary)]">Job Descriptions, Offer Letter Templates, and Interview Guides repository.</p>
          </div>
        )}

        {/* 9. ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <ActivityFeed activities={vacancy.activities} />
        )}
      </main>
    </div>
  );
};
