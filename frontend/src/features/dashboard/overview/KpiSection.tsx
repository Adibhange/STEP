'use client';

import React from 'react';
import { MetricGrid } from '../shared/MetricGrid';
import { KPI_DATA } from '../mock/kpi.mock';

/**
 * STEP Enterprise KpiSection
 *
 * Renders the KPI metric grid for the dashboard overview.
 * Uses MetricGrid which is reusable across all future dashboard modules.
 */
export const KpiSection: React.FC = () => {
  return (
    <section aria-label="Key performance indicators">
      <MetricGrid items={KPI_DATA} />
    </section>
  );
};
