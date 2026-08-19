'use client';

import React from 'react';
import { MetricGrid } from '../shared/MetricGrid';
import { type KpiItem } from '@/features/dashboard/types/dashboard.types';
import {
  useGetRecruitmentFunnelQuery,
  useGetCandidatesQuery,
} from '@/store/services/api';

/**
 * STEP Enterprise KpiSection
 *
 * Renders the KPI metric grid for the dashboard overview.
 * Sourced dynamically from recruitment funnel API and live candidate datasets.
 */
export const KpiSection: React.FC = () => {
  const { data: funnelResponse, isLoading: isFunnelLoading } = useGetRecruitmentFunnelQuery();
  const { data: candidatesResponse, isLoading: isCandidatesLoading } = useGetCandidatesQuery();

  const dynamicKpiData: KpiItem[] = React.useMemo(() => {
    const f = funnelResponse?.data;
    const candidates = candidatesResponse?.data || [];

    const totalCount = f?.totalCandidates ?? f?.totalApplications ?? candidates.length;

    const screeningCount =
      f?.appliedCount ??
      candidates.filter((c: any) => {
        const stage = (c.currentStage || c.status || '').toLowerCase();
        return stage.includes('screen') || stage.includes('applied') || stage.includes('register');
      }).length;

    const interviewCount =
      f?.inProgressCount ??
      candidates.filter((c: any) => {
        const stage = (c.currentStage || c.status || '').toLowerCase();
        return (
          stage.includes('interview') ||
          stage.includes('assess') ||
          stage.includes('director') ||
          stage.includes('round') ||
          stage.includes('tech')
        );
      }).length;

    const offeredCount =
      f?.offeredCount ??
      candidates.filter((c: any) => {
        const status = (c.status || c.currentStage || '').toLowerCase();
        return status.includes('offer');
      }).length;

    const onHoldCount =
      f?.withdrawnCount ??
      f?.onHoldCount ??
      candidates.filter((c: any) => {
        const status = (c.status || c.currentStage || '').toLowerCase();
        return status.includes('hold') || status.includes('withdraw');
      }).length;

    const rejectedCount =
      f?.rejectedCount ??
      candidates.filter((c: any) => {
        const status = (c.status || c.currentStage || '').toLowerCase();
        return status.includes('reject');
      }).length;

    const hiredCount =
      f?.joinedCount ??
      candidates.filter((c: any) => {
        const status = (c.status || c.currentStage || '').toLowerCase();
        return status.includes('hire') || status.includes('join');
      }).length;

    return [
      {
        id: 'total',
        title: 'Total Candidates',
        count: totalCount,
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
        count: screeningCount,
        trend: 0,
        trendLabel: 'applied',
        subMetric: 'Applications Received',
        icon: 'filter',
        colorToken: '--accent-cyan',
        bgToken: '--accent-cyan-dim',
      },
      {
        id: 'in-interview',
        title: 'In Interview',
        count: interviewCount,
        trend: 0,
        trendLabel: 'in progress',
        subMetric: 'Pipeline Active',
        icon: 'mic',
        colorToken: '--accent-violet',
        bgToken: '--accent-violet-dim',
      },
      {
        id: 'offered',
        title: 'Offered',
        count: offeredCount,
        trend: 0,
        trendLabel: 'offered',
        subMetric: 'Offers Extended',
        icon: 'send',
        colorToken: '--accent-blue',
        bgToken: '--accent-blue-dim',
      },
      {
        id: 'on-hold',
        title: 'On Hold',
        count: onHoldCount,
        trend: 0,
        trendLabel: 'withdrawn',
        subMetric: 'Withdrawn / Hold',
        icon: 'pause-circle',
        colorToken: '--accent-orange',
        bgToken: '--accent-orange-dim',
      },
      {
        id: 'rejected',
        title: 'Rejected',
        count: rejectedCount,
        trend: 0,
        trendLabel: 'archived',
        subMetric: 'Rejected Candidates',
        icon: 'x-circle',
        colorToken: '--accent-red',
        bgToken: '--accent-red-dim',
      },
      {
        id: 'hired',
        title: 'Hired',
        count: hiredCount,
        trend: 0,
        trendLabel: 'joined',
        subMetric: 'Joined Candidates',
        icon: 'check-circle',
        colorToken: '--accent-green',
        bgToken: '--accent-green-dim',
      },
    ];
  }, [funnelResponse, candidatesResponse]);

  const isLoading = isFunnelLoading && isCandidatesLoading;

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
