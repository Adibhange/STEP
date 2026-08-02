'use client';

import React from 'react';
import { KpiSection, CandidateWorkspace } from '@/features/dashboard';

/**
 * STEP Enterprise Dashboard Page
 *
 * The primary daily-use dashboard for the recruitment operations team.
 * Layout:
 *   - KPI Metric Row (pipeline KPIs with animated counter & trend badge)
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
