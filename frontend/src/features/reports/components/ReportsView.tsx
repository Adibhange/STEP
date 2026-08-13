'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { StatsCard } from '@/features/shared/stats-card/StatsCard';
import { useGetRecruitmentFunnelQuery } from '@/store/services/api';

export type ReportTabId = 'recruitment' | 'vacancies' | 'candidates' | 'assessments' | 'interviews' | 'walkin' | 'exports';

export const REPORT_TABS = [
  { id: 'recruitment', label: 'Recruitment' },
  { id: 'vacancies', label: 'Vacancies' },
  { id: 'candidates', label: 'Candidates' },
  { id: 'assessments', label: 'Assessments' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'walkin', label: 'Walk-in Drives' },
  { id: 'exports', label: 'Data Exports' },
] as const;

export const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTabId>('recruitment');
  const { data: funnelRes, isLoading } = useGetRecruitmentFunnelQuery();
  const f = funnelRes?.data;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] font-heading tracking-tight">
          Recruitment Analytics & Dashboards
        </h1>
        <p className="text-[13px] text-[var(--text-tertiary)]">
          Interactive dashboards for hiring velocity, vacancy status, candidate conversion, and proctored assessment scoring.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[var(--border-default)] overflow-x-auto scrollbar-none pb-1">
        {REPORT_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ReportTabId)}
              className={`px-3.5 py-2 text-[12.5px] font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[var(--accent-indigo)] text-[var(--accent-indigo)] font-bold'
                  : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-[var(--surface-2)] rounded-[var(--radius-lg)]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeTab === 'recruitment' && (
            <>
              <StatsCard title="Total Applications" count={f?.totalApplications ?? 0} subtitle="Database total candidates" icon="users" colorToken="--accent-indigo" bgToken="--accent-indigo-dim" />
              <StatsCard title="Assessments Passed" count={f?.assessmentPassed ?? 0} subtitle="Proctored test cleared" icon="check-circle" colorToken="--accent-green" bgToken="--accent-green-dim" />
              <StatsCard title="Interviews Cleared" count={f?.interviewCleared ?? 0} subtitle="Technical & Director rounds" icon="mic" colorToken="--accent-cyan" bgToken="--accent-cyan-dim" />
              <StatsCard title="Offers Issued" count={f?.offersIssued ?? 0} subtitle="Generated offer letters" icon="send" colorToken="--accent-violet" bgToken="--accent-violet-dim" />
            </>
          )}

          {activeTab === 'vacancies' && (
            <>
              <StatsCard title="Open Vacancies" count={f?.openVacancies ?? 0} subtitle="Active recruitment campaigns" icon="briefcase" colorToken="--accent-indigo" bgToken="--accent-indigo-dim" />
              <StatsCard title="Total Applications" count={f?.totalApplications ?? 0} subtitle="Across active openings" icon="building" colorToken="--accent-cyan" bgToken="--accent-cyan-dim" />
              <StatsCard title="On Hold Count" count={f?.onHoldCount ?? 0} subtitle="Pending decision" icon="file-text" colorToken="--accent-orange" bgToken="--accent-orange-dim" />
              <StatsCard title="Joined Candidates" count={f?.joinedCount ?? 0} subtitle="Hired & onboarded" icon="check-circle" colorToken="--accent-green" bgToken="--accent-green-dim" />
            </>
          )}

          {activeTab === 'candidates' && (
            <>
              <StatsCard title="Total Candidates" count={f?.totalApplications ?? 0} subtitle="Database total candidates" icon="users" colorToken="--accent-indigo" bgToken="--accent-indigo-dim" />
              <StatsCard title="Screened & Passed" count={f?.assessmentPassed ?? 0} subtitle="Evaluation passed" icon="check-circle" colorToken="--accent-green" bgToken="--accent-green-dim" />
              <StatsCard title="Interview Cleared" count={f?.interviewCleared ?? 0} subtitle="Active round evaluations" icon="calendar" colorToken="--accent-violet" bgToken="--accent-violet-dim" />
              <StatsCard title="Rejected Count" count={f?.rejectedCount ?? 0} subtitle="Archived candidates" icon="x-circle" colorToken="--status-danger" bgToken="--accent-red-dim" />
            </>
          )}

          {activeTab === 'walkin' && (
            <>
              <StatsCard title="Walk-In Registered" count={f?.totalApplications ?? 0} subtitle="QR & on-site forms" icon="grid" colorToken="--accent-indigo" bgToken="--accent-indigo-dim" />
              <StatsCard title="Assessments Passed" count={f?.assessmentPassed ?? 0} subtitle="Completed initial round" icon="users" colorToken="--accent-green" bgToken="--accent-green-dim" />
              <StatsCard title="Interviews Cleared" count={f?.interviewCleared ?? 0} subtitle="Cleared F2F interview" icon="trending-up" colorToken="--accent-cyan" bgToken="--accent-cyan-dim" />
              <StatsCard title="Hired & Joined" count={f?.joinedCount ?? 0} subtitle="Successful onboardings" icon="check-circle" colorToken="--accent-green" bgToken="--accent-green-dim" />
            </>
          )}

          {(activeTab === 'assessments' || activeTab === 'interviews' || activeTab === 'exports') && (
            <>
              <StatsCard title="Assessments Passed" count={f?.assessmentPassed ?? 0} subtitle="Proctored online tests" icon="clipboard-check" colorToken="--accent-indigo" bgToken="--accent-indigo-dim" />
              <StatsCard title="Interviews Cleared" count={f?.interviewCleared ?? 0} subtitle="Passed evaluation" icon="bar-chart-2" colorToken="--accent-cyan" bgToken="--accent-cyan-dim" />
              <StatsCard title="Offers Issued" count={f?.offersIssued ?? 0} subtitle="Issued offer letters" icon="calendar" colorToken="--accent-violet" bgToken="--accent-violet-dim" />
              <StatsCard title="Joined Candidates" count={f?.joinedCount ?? 0} subtitle="Joined organization" icon="check-circle" colorToken="--accent-green" bgToken="--accent-green-dim" />
            </>
          )}
        </div>
      )}
    </div>
  );
};
