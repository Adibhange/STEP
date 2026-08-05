'use client';

import React from 'react';
import { MetricGrid } from '../shared/MetricGrid';
import { type KpiItem } from '@/features/dashboard/types/dashboard.types';
import { useGetRecruitmentFunnelQuery } from '@/store/services/api';

/**
 * STEP Enterprise KpiSection
 *
 * Renders the KPI metric grid for the dashboard overview.
 * Sourced 100% dynamically from backend recruitment funnel API.
 */
export const KpiSection: React.FC = () => {
  const { data: funnelResponse, isLoading } = useGetRecruitmentFunnelQuery();

  const dynamicKpiData: KpiItem[] = React.useMemo(() => {
    const f = funnelResponse?.data;
    return [
      {
        id: 'total',
        title: 'Total Candidates',
        count: f?.totalApplications ?? 0,
        trend: 0,
        trendLabel: 'total',
        subMetric: 'Active Candidates',
        icon: 'users',
        colorToken: '--accent-indigo',
        bgToken: '--accent-indigo-dim',
      },
      {
        id: 'screening',
        title: 'Screening',
        count: f?.assessmentPassed ?? 0,
        trend: 0,
        trendLabel: 'passed',
        subMetric: 'Assessments Passed',
        icon: 'filter',
        colorToken: '--accent-cyan',
        bgToken: '--accent-cyan-dim',
      },
      {
        id: 'in-interview',
        title: 'In Interview',
        count: f?.interviewCleared ?? 0,
        trend: 0,
        trendLabel: 'cleared',
        subMetric: 'Interviews Cleared',
        icon: 'mic',
        colorToken: '--accent-violet',
        bgToken: '--accent-violet-dim',
      },
      {
        id: 'offered',
        title: 'Offered',
        count: f?.offersIssued ?? 0,
        trend: 0,
        trendLabel: 'issued',
        subMetric: 'Offers Issued',
        icon: 'send',
        colorToken: '--accent-blue',
        bgToken: '--accent-blue-dim',
      },
      {
        id: 'on-hold',
        title: 'On Hold',
        count: f?.onHoldCount ?? 0,
        trend: 0,
        trendLabel: 'on hold',
        subMetric: 'Pending feedback',
        icon: 'pause-circle',
        colorToken: '--status-warning',
        bgToken: '--status-warning-bg',
      },
      {
        id: 'rejected',
        title: 'Rejected',
        count: f?.rejectedCount ?? 0,
        trend: 0,
        trendLabel: 'archived',
        subMetric: 'Rejected Candidates',
        icon: 'x-circle',
        colorToken: '--status-danger',
        bgToken: '--status-danger-bg',
      },
      {
        id: 'hired',
        title: 'Hired',
        count: f?.joinedCount ?? 0,
        trend: 0,
        trendLabel: 'joined',
        subMetric: 'Joined Candidates',
        icon: 'check-circle',
        colorToken: '--status-success',
        bgToken: '--status-success-bg',
      },
    ];
  }, [funnelResponse]);

  if (isLoading) {
    return (
      <section aria-label="Key performance indicators">
        <MetricGrid items={[]} loading={true} />
      </section>
    );
  }

  return (
    <section aria-label="Key performance indicators">
      <MetricGrid items={dynamicKpiData} />
    </section>
  );
};
