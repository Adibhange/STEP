'use client';

import React from 'react';
import { WelcomeSection } from '@/features/dashboard/overview/WelcomeSection';
import { KpiSection } from '@/features/dashboard/overview/KpiSection';
import { CandidateWorkspace } from '@/features/dashboard/candidates/CandidateWorkspace';

/**
 * STEP Enterprise Dashboard Page
 *
 * The primary daily-use dashboard for the recruitment operations team.
 * Layout:
 *   - Welcome Section (greeting + today's stats)
 *   - KPI Metric Row (9 pipeline KPIs)
 *   - Candidate Workspace (table + filters + pagination)
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-3.5 p-3.5 sm:p-5">
      {/* KPI Row */}
      <KpiSection />

      {/* Candidate workspace */}
      <CandidateWorkspace />
    </div>
  );
}
