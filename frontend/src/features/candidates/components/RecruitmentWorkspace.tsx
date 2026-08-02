'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/design-system';
import { WorkspaceHeader, type WorkspaceHeaderTab } from '@/features/shared/workspace-header/WorkspaceHeader';
import { ActivityFeed } from '@/features/shared/activity-feed/ActivityFeed';

export interface RecruitmentWorkspaceProps {
  candidateId?: string;
}

const WORKSPACE_TABS: WorkspaceHeaderTab[] = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'assessment', label: 'Assessment', icon: 'clipboard-check' },
  { id: 'interview', label: 'Interview', icon: 'calendar' },
  { id: 'communications', label: 'Communications', icon: 'mail' },
  { id: 'offer', label: 'Offer', icon: 'award' },
  { id: 'activity', label: 'Activity', icon: 'list' },
];

export const RecruitmentWorkspace: React.FC<RecruitmentWorkspaceProps> = ({
  candidateId = 'cand-1',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams?.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/dashboard/candidates/${candidateId}/workspace?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-5 pb-16">
      {/* ── 1. Workspace Header ────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-3">
        <WorkspaceHeader
          title="Aditya Bhange — Recruitment Workspace"
          status="In Interview"
          statusVariant="info"
          onBack={() => router.push(`/dashboard/candidates/${candidateId}`)}
          backLabel="Back to Profile"
          metadata={[
            { label: 'ID', value: 'CAND-2026-089' },
            { label: 'Role', value: 'Senior React Developer', icon: 'briefcase' },
            { label: 'Vacancy', value: 'VAC-2026-101', icon: 'briefcase' },
          ]}
          tabs={WORKSPACE_TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* ── 2. Top Compact Strip: Recruitment Overview ───────────────────────── */}
      <div className="px-4 sm:px-6">
        <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-3 shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[12px] divide-x divide-[var(--border-soft)]">
            <div className="px-3 flex flex-col">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Current Stage</span>
              <span className="font-bold text-[var(--accent-indigo)] mt-0.5">Technical Interview</span>
            </div>
            <div className="px-3 flex flex-col">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Assigned Recruiter</span>
              <span className="font-semibold text-[var(--text-primary)] mt-0.5">Sneha Kulkarni</span>
            </div>
            <div className="px-3 flex flex-col">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Assessment</span>
              <span className="font-bold text-[var(--status-success-text)] font-mono mt-0.5">Passed (92%)</span>
            </div>
            <div className="px-3 flex flex-col">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Interview Schedule</span>
              <span className="font-semibold text-[var(--text-primary)] font-mono mt-0.5">Tomorrow 11:30 AM</span>
            </div>
            <div className="px-3 flex flex-col">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Offer Status</span>
              <span className="font-semibold text-[var(--text-tertiary)] mt-0.5">Not Started</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Tab Content Panels ───────────────────────────────────────────── */}
      <main className="px-4 sm:px-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 shadow-2xs flex flex-col gap-3">
              <h3 className="text-[14px] font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-2 font-heading">
                Assessment Status Summary
              </h3>
              <div className="flex justify-between items-center text-[12.5px]">
                <span className="text-[var(--text-secondary)] font-medium">Question Paper</span>
                <span className="font-bold text-[var(--text-primary)]">React JS - 3 Years</span>
              </div>
              <div className="flex justify-between items-center text-[12.5px]">
                <span className="text-[var(--text-secondary)] font-medium">Score</span>
                <span className="font-mono font-bold text-[var(--status-success-text)]">92 / 100</span>
              </div>
              <button
                onClick={() => handleTabChange('assessment')}
                className="mt-2 h-8 px-3 text-[12px] font-bold text-[var(--accent-indigo)] border border-[var(--border-default)] rounded-full hover:bg-[var(--surface-hover)] self-start"
              >
                Go to Assessment Tab →
              </button>
            </div>

            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 shadow-2xs flex flex-col gap-3">
              <h3 className="text-[14px] font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-2 font-heading">
                Interview Operations
              </h3>
              <div className="flex justify-between items-center text-[12.5px]">
                <span className="text-[var(--text-secondary)] font-medium">Upcoming Interview</span>
                <span className="font-bold text-[var(--accent-indigo)]">Round 1 (Tomorrow)</span>
              </div>
              <div className="flex justify-between items-center text-[12.5px]">
                <span className="text-[var(--text-secondary)] font-medium">Interviewer</span>
                <span className="font-semibold text-[var(--text-primary)]">Akshay Patil</span>
              </div>
              <button
                onClick={() => handleTabChange('interview')}
                className="mt-2 h-8 px-3 text-[12px] font-bold text-[var(--accent-indigo)] border border-[var(--border-default)] rounded-full hover:bg-[var(--surface-hover)] self-start"
              >
                Manage Interviews →
              </button>
            </div>
          </div>
        )}

        {/* ASSESSMENT TAB */}
        {activeTab === 'assessment' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-2xs flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="text-[15px] font-extrabold text-[var(--text-primary)] font-heading">
                Assessment Operational Workspace
              </h3>
              <span className="text-[11.5px] font-mono font-bold text-[var(--status-success-text)] bg-[var(--status-success-bg)] px-2.5 py-0.5 rounded-full border border-[var(--status-success)]">
                Passed (92%)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[12.5px]">
              <div className="p-3 bg-[var(--surface-2)] rounded-[var(--radius-md)] border border-[var(--border-soft)]">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Question Paper</span>
                <span className="font-bold text-[var(--text-primary)] mt-1 block">React JS - 3 Years</span>
              </div>
              <div className="p-3 bg-[var(--surface-2)] rounded-[var(--radius-md)] border border-[var(--border-soft)]">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Attempts</span>
                <span className="font-bold text-[var(--text-primary)] mt-1 block">1 Attempt (18 Jul 2026)</span>
              </div>
              <div className="p-3 bg-[var(--surface-2)] rounded-[var(--radius-md)] border border-[var(--border-soft)]">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Violations Log</span>
                <span className="font-bold text-[var(--status-success-text)] mt-1 block">0 Violations (Clean)</span>
              </div>
              <div className="p-3 bg-[var(--surface-2)] rounded-[var(--radius-md)] border border-[var(--border-soft)]">
                <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Evaluation Mode</span>
                <span className="font-bold text-[var(--text-primary)] mt-1 block">Auto & Manual Verified</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <h4 className="text-[13px] font-bold text-[var(--text-primary)] font-heading">Section Performance Breakdown</h4>
              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between items-center p-2.5 bg-[var(--surface-2)] rounded-md">
                  <span>MCQ Section (React & TypeScript)</span>
                  <span className="font-mono font-bold text-[var(--status-success-text)]">48 / 50</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-[var(--surface-2)] rounded-md">
                  <span>Coding Challenge (Custom Hook & State Sync)</span>
                  <span className="font-mono font-bold text-[var(--status-success-text)]">44 / 50</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INTERVIEW TAB */}
        {activeTab === 'interview' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-2xs flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="text-[15px] font-extrabold text-[var(--text-primary)] font-heading">
                Interview Operations Center
              </h3>
              <button className="h-8 px-3.5 bg-[var(--accent-indigo)] text-[var(--text-on-accent)] text-[12px] font-bold rounded-full hover:bg-[var(--accent-indigo-hover)]">
                + Schedule New Interview
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-[13px] font-bold text-[var(--text-primary)] font-heading uppercase tracking-wider">
                Upcoming Interviews
              </h4>
              <div className="p-4 bg-[var(--surface-2)] rounded-[var(--radius-md)] border border-[var(--border-default)] flex items-center justify-between">
                <div className="flex flex-col gap-1 text-[12.5px]">
                  <span className="font-extrabold text-[var(--text-primary)]">Technical Interview (Round 1)</span>
                  <span className="text-[var(--text-secondary)] font-mono">Tomorrow 11:30 AM IST • Google Meet</span>
                  <span className="text-[var(--text-tertiary)]">Interviewer: Akshay Patil</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-7.5 px-3 rounded-full border border-[var(--border-default)] text-[11.5px] font-bold hover:bg-[var(--surface-hover)]">
                    Generate Meeting Link
                  </button>
                  <button className="h-7.5 px-3 rounded-full bg-[var(--accent-indigo)] text-white text-[11.5px] font-bold">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMMUNICATIONS TAB (TIMELINE BASED WITH TYPE CHIPS) */}
        {activeTab === 'communications' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-2xs flex flex-col gap-4">
            <h3 className="text-[15px] font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
              Communication Timeline Log
            </h3>

            <div className="flex flex-col gap-3 pt-2 text-[12.5px]">
              <div className="flex gap-3 p-3 bg-[var(--surface-2)] rounded-[var(--radius-md)] border border-[var(--border-soft)]">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-blue-dim)] text-[var(--accent-blue-hover)] shrink-0 self-start font-mono">
                  EMAIL
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-[var(--text-primary)]">Assessment Invitation Sent</span>
                  <span className="text-[11px] text-[var(--text-tertiary)] font-mono">Today • Sent via System Bot</span>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-[var(--surface-2)] rounded-[var(--radius-md)] border border-[var(--border-soft)]">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-violet-dim)] text-[var(--accent-violet-hover)] shrink-0 self-start font-mono">
                  MEETING
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-[var(--text-primary)]">Google Meet Invite Sent to Akshay Patil</span>
                  <span className="text-[11px] text-[var(--text-tertiary)] font-mono">Yesterday • Calendar Event Created</span>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-[var(--surface-2)] rounded-[var(--radius-md)] border border-[var(--border-soft)]">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-orange-dim)] text-[var(--accent-orange-hover)] shrink-0 self-start font-mono">
                  SMS
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-[var(--text-primary)]">Interview Slot Confirmation Reminder</span>
                  <span className="text-[11px] text-[var(--text-tertiary)] font-mono">17 Jul 2026 • Delivered</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OFFER TAB (LIFECYCLE STATUS) */}
        {activeTab === 'offer' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-2xs flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="text-[15px] font-extrabold text-[var(--text-primary)] font-heading">
                Offer Management & Lifecycle
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] font-bold font-mono">
                <span className="px-2 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-primary)]">Draft</span> →
                <span className="px-2 py-0.5 rounded bg-[var(--accent-indigo-dim)] text-[var(--accent-indigo-hover)]">Generated</span> →
                <span className="px-2 py-0.5 rounded opacity-40">Sent</span> →
                <span className="px-2 py-0.5 rounded opacity-40">Accepted</span>
              </div>
            </div>

            <div className="p-4 bg-[var(--surface-2)] rounded-[var(--radius-md)] border border-[var(--border-default)] flex justify-between items-center">
              <div className="flex flex-col gap-1 text-[12.5px]">
                <span className="font-bold text-[var(--text-primary)]">Offer Details</span>
                <span className="text-[var(--text-secondary)]">Offered CTC: ₹ 22.5 LPA • Notice Buyout: Included</span>
              </div>
              <button className="h-8 px-4 bg-[var(--accent-indigo)] text-white text-[12px] font-bold rounded-full">
                Generate Offer Letter
              </button>
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <ActivityFeed
            activities={[
              { id: '1', timestamp: '2 hours ago', user: 'Sneha Kulkarni', title: 'Interview Scheduled', description: 'Assigned Round 1 Technical Interview to Akshay Patil.' },
              { id: '2', timestamp: 'Yesterday', user: 'System Bot', title: 'Assessment Evaluation Completed', description: 'Scored 92/100 on React JS - 3 Years paper.' },
            ]}
          />
        )}
      </main>
    </div>
  );
};
