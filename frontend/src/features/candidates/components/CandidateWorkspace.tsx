'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/design-system';
import { WorkspaceHeader, type WorkspaceHeaderTab } from '@/features/shared/workspace-header/WorkspaceHeader';
import { ActivityFeed } from '@/features/shared/activity-feed/ActivityFeed';

export interface CandidateWorkspaceProps {
  candidateId?: string;
}

const TABS: WorkspaceHeaderTab[] = [
  { id: 'overview', label: 'Overview', icon: 'user' },
  { id: 'assessment', label: 'Assessment', icon: 'clipboard-check' },
  { id: 'interviews', label: 'Interviews', icon: 'calendar' },
  { id: 'documents', label: 'Documents', icon: 'file-text' },
  { id: 'activity', label: 'Activity', icon: 'list' },
];

/**
 * STEP Enterprise Candidate Workspace Component
 */
export const CandidateWorkspace: React.FC<CandidateWorkspaceProps> = ({ candidateId = 'cand-1' }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* Universal WorkspaceHeader Primitive */}
      <WorkspaceHeader
        title="Aditya Bhange"
        status="Screening"
        statusVariant="info"
        onBack={() => router.push('/dashboard')}
        backLabel="Back to Candidate Workspace"
        metadata={[
          { label: 'ID', value: 'CAND-2026-089' },
          { label: 'Role Applied', value: 'Senior React Developer', icon: 'briefcase' },
          { label: 'Experience', value: '4.5 Years', icon: 'bar-chart-2' },
          { label: 'Location', value: 'Pune', icon: 'building' },
        ]}
        actions={
          <>
            <button
              type="button"
              className="h-8.5 px-3.5 flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-1)] text-[12px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] cursor-pointer shadow-2xs"
            >
              <Icon name="mail" size="xs" />
              <span>Send Email</span>
            </button>
            <button
              type="button"
              className="h-8.5 px-4 flex items-center gap-1.5 rounded-full bg-[var(--accent-indigo)] text-[var(--text-on-accent)] text-[12px] font-bold hover:bg-[var(--accent-indigo-hover)] cursor-pointer shadow-2xs"
            >
              <Icon name="calendar" size="xs" />
              <span>Schedule Interview</span>
            </button>
          </>
        }
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Workspace Tab Panels */}
      <main className="px-4 sm:px-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-4 shadow-2xs">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
                Candidate Profile Overview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Email Address</span>
                  <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">aditya.bhange@example.com</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Phone Number</span>
                  <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">+91 98765 43210</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Applied Vacancy</span>
                  <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">Senior React / Next.js Developer</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">Notice Period</span>
                  <span className="font-semibold text-[var(--text-primary)] mt-0.5 block">15 Days (Immediate Joiner)</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 flex flex-col gap-4 shadow-2xs">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
                Evaluation Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[12.5px]">
                  <span className="text-[var(--text-secondary)] font-medium">Online Assessment Score</span>
                  <span className="font-mono font-bold text-[var(--status-success-text)]">88% (Passed)</span>
                </div>
                <div className="flex justify-between items-center text-[12.5px]">
                  <span className="text-[var(--text-secondary)] font-medium">Technical Interview</span>
                  <span className="font-mono font-bold text-[var(--accent-indigo)]">Strong Hire</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-2xs">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
              Assessment Results
            </h3>
            <p className="text-[12.5px] text-[var(--text-tertiary)] mt-2">Score: 88% on Advanced React 19 & TypeScript Enterprise Paper A.</p>
          </div>
        )}

        {activeTab === 'interviews' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-2xs">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
              Interview Rounds & Feedback
            </h3>
            <p className="text-[12.5px] text-[var(--text-tertiary)] mt-2">Round 1: Screening (Cleared) | Round 2: Tech Live Coding (Scheduled Aug 5).</p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-2xs">
            <h3 className="text-base font-extrabold text-[var(--text-primary)] border-b border-[var(--border-default)] pb-3 font-heading">
              Candidate Resume & Documents
            </h3>
            <p className="text-[12.5px] text-[var(--text-tertiary)] mt-2">Aditya_Bhange_Resume_2026.pdf uploaded.</p>
          </div>
        )}

        {activeTab === 'activity' && (
          <ActivityFeed
            activities={[
              { id: '1', timestamp: '2 hours ago', user: 'Aditya Bhange', title: 'Candidate Registered via QR', description: 'Registered at Pune Walk-in drive.' },
              { id: '2', timestamp: '1 hour ago', user: 'System Bot', title: 'Assessment Passed', description: 'Scored 88% on React Paper A.' },
            ]}
          />
        )}
      </main>
    </div>
  );
};
