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
        count: f.totalApplications ?? 500,
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
        count: f.assessmentPassed ?? 143,
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
        count: f.interviewCleared ?? 97,
        trend: 8,
        trendLabel: 'vs last week',
        subMetric: 'Interviews Cleared',
        icon: 'mic',
        colorToken: '--accent-violet',
        bgToken: '--accent-violet-dim',
      },
      {
        id: 'offered',
        title: 'Offered',
        count: f.offersIssued ?? 19,
        trend: 4,
        trendLabel: 'vs last month',
        subMetric: 'Offers Issued',
        icon: 'send',
        colorToken: '--accent-blue',
        bgToken: '--accent-blue-dim',
      },
      {
        id: 'on-hold',
        title: 'On Hold',
        count: f.onHoldCount ?? 32,
        trend: 2,
        trendLabel: 'vs last month',
        subMetric: '5 pending feedback',
        icon: 'pause-circle',
        colorToken: '--status-warning',
        bgToken: '--status-warning-bg',
      },
      {
        id: 'rejected',
        title: 'Rejected',
        count: f.rejectedCount ?? 87,
        trend: -11,
        trendLabel: 'vs last month',
        subMetric: '11 this week',
        icon: 'x-circle',
        colorToken: '--status-danger',
        bgToken: '--status-danger-bg',
      },
      {
        id: 'hired',
        title: 'Hired',
        count: f.joinedCount ?? 14,
        trend: 7,
        trendLabel: 'vs last month',
        subMetric: '3 joined today',
        icon: 'check-circle',
        colorToken: '--status-success',
        bgToken: '--status-success-bg',
      },
    ];
  }, [funnelResponse]);

  return (
    <section aria-label="Key performance indicators">
      <MetricGrid items={dynamicKpiData} />
    </section>
  );
};
