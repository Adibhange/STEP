'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@/design-system';

export interface StatsCardProps {
  id?: string;
  title: string;
  count: number | string;
  subtitle: string;
  icon: string;
  colorToken?: string; // e.g. '--accent-indigo'
  bgToken?: string;    // e.g. '--accent-indigo-dim'
  trend?: number;
  trendLabel?: string;
  active?: boolean;
  onClick?: () => void;
}

/**
 * AnimatedCounter Primitive — Smooth ease-out cubic count-up animation for KPI hero numbers
 */
const AnimatedCounter: React.FC<{ value: number | string }> = ({ value }) => {
  const numericVal = typeof value === 'number' ? value : parseInt(String(value), 10);
  const [displayVal, setDisplayVal] = useState<number>(isNaN(numericVal) ? 0 : 0);

  useEffect(() => {
    if (isNaN(numericVal)) return;
    let startTimestamp: number | null = null;
    const duration = 800; // 800ms smooth count-up

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out cubic: 1 - (1 - x)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.floor(eased * numericVal));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayVal(numericVal);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [numericVal]);

  if (isNaN(numericVal)) return <>{value}</>;
  return <>{displayVal.toLocaleString()}</>;
};

/**
 * STEP Enterprise StatsCard Primitive (Frozen KPI Card Component)
 *
 * Unified KPI metric card used across Dashboard, Vacancies, Reports, Assessments.
 * Features 3px top accent bar, animated trend arrow badge on hover (diagonally nudges ↑/↓),
 * animated counter for hero numbers, soft vertical gradient, 850 font-black count, 700 font-bold title,
 * and 180ms hover motion lift (2px) with icon scale (1.03).
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  count,
  subtitle,
  icon,
  colorToken = '--accent-indigo',
  bgToken = '--accent-indigo-dim',
  trend,
  trendLabel,
  active = false,
  onClick,
}) => {
  const accentColor = `var(${colorToken})`;
  const bgColor = `var(${bgToken})`;

  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: `linear-gradient(180deg, var(--surface-1) 35%, ${bgColor} 100%)`,
      }}
      className={`
        group relative flex flex-col justify-between p-4 rounded-[var(--radius-lg)] border
        transition-all duration-180 ease-out cursor-pointer select-none overflow-hidden
        hover:-translate-y-[2px] hover:shadow-[var(--shadow-md)]
        ${
          active
            ? 'border-[var(--accent-indigo)] shadow-[var(--shadow-md)]'
            : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
        }
      `}
    >
      {/* 3px Top Accent Indicator Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] transition-opacity duration-180 group-hover:opacity-100"
        style={{ background: accentColor, opacity: active ? 1 : 0.85 }}
      />

      {/* Header: Icon + Title + Animated Trend Arrow Badge */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5 pt-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-transform duration-180 ease-out group-hover:scale-[1.05]"
            style={{ background: bgColor, color: accentColor }}
          >
            <Icon name={icon as any} size="xs" />
          </span>
          <h3 className="text-[13px] font-bold text-[var(--text-primary)] font-heading leading-tight truncate">
            {title}
          </h3>
        </div>

        {/* Animated Trend Arrow Pill Badge */}
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10.5px] font-bold px-1.5 py-0.5 rounded-full font-mono shrink-0
              transition-all duration-200 group-hover:scale-105 ${
              isPositiveTrend
                ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success)]'
                : 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)] border border-[var(--status-danger)]'
            }`}
          >
            <span className={`inline-block transition-transform duration-200 ${
              isPositiveTrend
                ? 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
                : 'group-hover:translate-y-0.5 group-hover:translate-x-0.5'
            }`}>
              <Icon name={isPositiveTrend ? 'trending-up' : 'trending-down'} size="xs" />
            </span>
            <span>{isPositiveTrend ? `+${trend}` : trend}{trendLabel?.trim() === '%' ? '%' : ''}</span>
          </span>
        )}
      </div>

      {/* KPI Hero Count with Smooth Counter Animation & Subtitle Stack */}
      <div className="flex flex-col mt-0.5">
        <span className="text-[23px] font-black text-[var(--text-primary)] font-mono tracking-tight leading-none">
          <AnimatedCounter value={count} />
        </span>
        <span className="text-[11px] font-semibold text-[var(--text-secondary)] opacity-75 mt-1 truncate">
          {subtitle}
        </span>
      </div>
    </div>
  );
};
