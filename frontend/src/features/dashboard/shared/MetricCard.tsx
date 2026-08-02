'use client';

import React from 'react';
import { StatsCard } from '@/features/shared/stats-card/StatsCard';
import type { KpiItem } from '@/mock/dashboard';

interface MetricCardProps {
  item: KpiItem;
  active?: boolean;
  onClick?: () => void;
}

/**
 * STEP Enterprise MetricCard Component
 * Wraps generic StatsCard primitive for Dashboard KPI cards.
 */
export const MetricCard: React.FC<MetricCardProps> = ({ item, active = false, onClick }) => {
  return (
    <StatsCard
      id={item.id}
      title={item.title}
      count={item.count}
      subtitle={item.subMetric || ''}
      icon={item.icon}
      colorToken={item.colorToken}
      bgToken={item.bgToken}
      trend={item.trend}
      trendLabel={item.trendLabel}
      active={active}
      onClick={onClick}
    />
  );
};
