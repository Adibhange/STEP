'use client';

import React from 'react';
import { CURRENT_USER, PLATFORM_STATS } from '../mock/dashboard.mock';

/**
 * Greeting based on current hour
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * STEP Enterprise WelcomeSection
 *
 * Minimal welcome banner — no hero image, no decorative elements.
 * Shows greeting, user name, and a compact stat strip.
 */
export const WelcomeSection: React.FC = () => {
  const greeting = getGreeting();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[var(--space-md)]">
      {/* Greeting */}
      <div className="flex flex-col gap-[var(--space-3xs)]">
        <h1 className="text-[var(--type-h2-size)] font-bold text-[var(--text-primary)] tracking-tight leading-none font-heading">
          {greeting}, {CURRENT_USER.firstName} 👋
        </h1>
        <p className="text-[var(--type-body-md-size)] text-[var(--text-secondary)]">
          Here's what's happening across recruitment today.
        </p>
      </div>

      {/* Compact today stats strip */}
      <div className="flex items-center gap-[var(--space-md)] shrink-0">
        <StatPill label="Active Vacancies" value={PLATFORM_STATS.activeVacancies} icon="briefcase" />
        <div className="w-px h-6 bg-[var(--border-default)]" aria-hidden="true" />
        <StatPill label="Interviews Today" value={PLATFORM_STATS.scheduledInterviewsToday} icon="calendar" />
        <div className="w-px h-6 bg-[var(--border-default)]" aria-hidden="true" />
        <StatPill label="Pending Offers" value={PLATFORM_STATS.pendingOfferLetters} icon="send" />
      </div>
    </div>
  );
};

// ── StatPill ─────────────────────────────────────────────────────────────────

interface StatPillProps {
  label: string;
  value: number;
  icon: string;
}

const StatPill: React.FC<StatPillProps> = ({ label, value, icon }) => (
  <div className="flex flex-col items-center gap-[var(--space-3xs)]">
    <span className="text-lg font-bold text-[var(--text-primary)] font-mono font-tabular-nums leading-none">{value}</span>
    <span className="text-[var(--type-label-size)] text-[var(--text-tertiary)] uppercase tracking-[0.04em] font-semibold whitespace-nowrap">{label}</span>
  </div>
);
