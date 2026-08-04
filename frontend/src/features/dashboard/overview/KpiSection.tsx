'use client';

import React from 'react';
import { MetricGrid } from '../shared/MetricGrid';
import { KPI_DATA, type KpiItem } from '@/features/dashboard/mock/kpi.mock';
import { useGetRecruitmentFunnelQuery } from '@/store/services/api';

/**
 * STEP Enterprise KpiSection
 *
 * Renders the KPI metric grid for the dashboard overview.
 * Uses MetricGrid which is reusable across all future dashboard modules.
 */
export const KpiSection: React.FC = () => {
  const { data: funnelResponse } = useGetRecruitmentFunnelQuery();

  const dynamicKpiData: KpiItem[] = React.useMemo(() => {
    if (!funnelResponse?.data) return KPI_DATA;
    const f = funnelResponse.data;
    return [
      {
        id: 'total',
        title: 'Total Candidates',
        count: f.totalApplications || 500,
        trend: 12,
        trendLabel: 'this week',
        subMetric: 'Active Candidates',
        icon: 'users',
        colorToken: '--accent-indigo',
        bgToken: '--accent-indigo-dim',
      },
      {
        id: 'screening',
        title: 'Screening',
        count: f.assessmentPassed || 143,
        trend: 29,
        trendLabel: '%',
        subMetric: 'Assessments Passed',
        icon: 'filter',
        colorToken: '--accent-cyan',
        bgToken: '--accent-cyan-dim',
      },
      {
        id: 'in-interview',
        title: 'In Interview',
        count: f.interviewCleared || 97,
        trend: 8,
        trendLabel: 'vs last week',
        subMetric: 'Interviews Cleared',
        icon: 'mic',
        colorToken: '--accent-purple',
        bgToken: '--accent-purple-dim',
      },
      {
        id: 'offered',
        title: 'Offered',
        count: f.offersIssued || 48,
        trend: 5,
        trendLabel: 'this month',
        subMetric: 'Offers Issued',
        icon: 'award',
        colorToken: '--accent-emerald',
        bgToken: '--accent-emerald-dim',
      },
    ];
  }, [funnelResponse]);

  return (
    <section aria-label="Key performance indicators">
      <MetricGrid items={dynamicKpiData} />
    </section>
  );
};
