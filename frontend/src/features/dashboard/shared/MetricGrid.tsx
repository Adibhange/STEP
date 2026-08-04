'use client';

import React from 'react';
import { MetricCard } from './MetricCard';
import type { KpiItem } from '@/features/dashboard/types/dashboard.types';

interface MetricGridProps {
  items: KpiItem[];
  /** Loading state — renders skeleton placeholders */
  loading?: boolean;
}

/**
 * STEP Enterprise MetricGrid
 *
 * Horizontal grid rendering MetricCard components.
 * Top clearance padding (pt-1.5) ensures hover lift (-2px) is never clipped.
 */
export const MetricGrid: React.FC<MetricGridProps> = ({ items, loading = false }) => {
  if (loading) {
    return (
      <div className="flex flex-nowrap gap-[var(--space-sm)] overflow-x-auto pt-1.5 pb-2 scrollbar-step w-full">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[150px] flex-1 shrink-0 h-[110px] bg-[var(--shimmer-base)] rounded-[var(--radius-lg)] animate-[step-shimmer_1.8s_ease-in-out_infinite]"
            style={{
              backgroundImage: 'linear-gradient(90deg, var(--shimmer-base) 25%, var(--shimmer-highlight) 50%, var(--shimmer-base) 75%)',
              backgroundSize: '200% 100%',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex flex-nowrap gap-2.5 overflow-x-auto pt-1.5 pb-1 px-0.5 scrollbar-step w-full"
      role="list"
      aria-label="Key metrics"
    >
      {items.map((item) => (
        <div key={item.id} role="listitem" className="min-w-[160px] flex-1 shrink-0">
          <MetricCard item={item} />
        </div>
      ))}
    </div>
  );
};
