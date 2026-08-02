'use client';

import React, { useState } from 'react';
import { Icon } from '@/design-system';
import { StatsCard } from '@/features/shared/stats-card/StatsCard';

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

      {/* Dashboard KPI Grid using StatsCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeTab === 'recruitment' && (
          <>
            <StatsCard title="Time-to-Hire Avg" count="18 Days" subtitle="2 days faster than Q2 target" icon="clock" colorToken="--accent-indigo" bgToken="--accent-indigo-dim" />
            <StatsCard title="Offer Acceptance" count="88.4%" subtitle="19 offers accepted of 22" icon="check-circle" colorToken="--accent-emerald" bgToken="--accent-emerald-dim" />
            <StatsCard title="Total Candidates" count="1,420" subtitle="Active across 7 open vacancies" icon="users" colorToken="--accent-cyan" bgToken="--accent-cyan-dim" />
            <StatsCard title="Hiring Velocity" count="14 / Mo" subtitle="Engineering & TA teams" icon="trending-up" colorToken="--accent-violet" bgToken="--accent-violet-dim" />
          </>
        )}

        {activeTab === 'vacancies' && (
          <>
            <StatsCard title="Open Vacancies" count="7" subtitle="Active recruitment campaigns" icon="briefcase" colorToken="--accent-indigo" bgToken="--accent-indigo-dim" />
            <StatsCard title="Total Positions" count="42" subtitle="Across Pune & Mumbai HQ" icon="building" colorToken="--accent-cyan" bgToken="--accent-cyan-dim" />
            <StatsCard title="Draft Openings" count="3" subtitle="Internal review pending" icon="file-text" colorToken="--accent-amber" bgToken="--accent-amber-dim" />
            <StatsCard title="Filled Vacancies" count="12" subtitle="Completed in last 90 days" icon="check-circle" colorToken="--accent-emerald" bgToken="--accent-emerald-dim" />
          </>
        )}

        {activeTab === 'candidates' && (
          <>
            <StatsCard title="Applied Candidates" count="1,420" subtitle="Scanned or web submitted" icon="users" colorToken="--accent-indigo" bgToken="--accent-indigo-dim" />
            <StatsCard title="Shortlisted" count="500" subtitle="Passed initial criteria" icon="check-circle" colorToken="--accent-emerald" bgToken="--accent-emerald-dim" />
            <StatsCard title="Interview Stage" count="97" subtitle="Active round evaluations" icon="calendar" colorToken="--accent-violet" bgToken="--accent-violet-dim" />
            <StatsCard title="Rejected / Hold" count="823" subtitle="Archived candidate profiles" icon="x-circle" colorToken="--status-danger" bgToken="--accent-rose-dim" />
          </>
        )}

        {activeTab === 'walkin' && (
          <>
            <StatsCard title="QR Code Scans" count="840" subtitle="Flagship QR scanner activity" icon="grid" colorToken="--accent-indigo" bgToken="--accent-indigo-dim" />
            <StatsCard title="Walk-in Registrations" count="500" subtitle="Successful candidate forms" icon="users" colorToken="--accent-emerald" bgToken="--accent-emerald-dim" />
            <StatsCard title="Scan Conversion" count="59.5%" subtitle="Registrations per QR scan" icon="trending-up" colorToken="--accent-cyan" bgToken="--accent-cyan-dim" />
            <StatsCard title="Expired Scans" count="42" subtitle="Deadline window passed" icon="alert-triangle" colorToken="--accent-amber" bgToken="--accent-amber-dim" />
          </>
        )}

        {(activeTab === 'assessments' || activeTab === 'interviews' || activeTab === 'exports') && (
          <>
            <StatsCard title="Active Assessments" count="143" subtitle="Proctored online tests" icon="clipboard-check" colorToken="--accent-indigo" bgToken="--accent-indigo-dim" />
            <StatsCard title="Average Test Score" count="74.2%" subtitle="Across 3 question papers" icon="bar-chart-2" colorToken="--accent-cyan" bgToken="--accent-cyan-dim" />
            <StatsCard title="Interviews Today" count="7" subtitle="Scheduled in calendar" icon="calendar" colorToken="--accent-violet" bgToken="--accent-violet-dim" />
            <StatsCard title="Export Ready" count=".XLSX" subtitle="High-contrast Excel report" icon="download" colorToken="--accent-emerald" bgToken="--accent-emerald-dim" />
          </>
        )}
      </div>
    </div>
  );
};
