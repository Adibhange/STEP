'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { KpiSection, CandidateWorkspace } from '@/features/dashboard';
import { staggerContainer } from '@/design-system';

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
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="flex flex-col gap-3.5 p-3.5 sm:p-5"
    >
      {/* KPI Row */}
      <KpiSection />

      {/* Candidate workspace */}
      <CandidateWorkspace />
    </motion.div>
  );
}

