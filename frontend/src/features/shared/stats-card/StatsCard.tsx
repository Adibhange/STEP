'use client';

import React from 'react';
import { Icon } from '@/design-system';

export interface StatsCardProps {
  id?: string;
  title: string;
  count: number | string;
  subtitle: string;
  icon: string;
  colorToken?: string; // e.g. '--accent-indigo'
  bgToken?: string;    // e.g. '--accent-indigo-dim'
  active?: boolean;
  onClick?: () => void;
}

/**
 * STEP Enterprise StatsCard Primitive (Frozen KPI Card Component)
 *
 * Unified KPI metric card used across Dashboard, Vacancies, Reports, Assessments.
 * Features 3px top accent bar, soft vertical gradient, 850 font-black count, 700 font-bold title,
 * and 180ms hover motion lift (2px) with icon scale (1.03).
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  count,
  subtitle,
  icon,
  colorToken = '--accent-indigo',
  bgToken = '--accent-indigo-dim',
  active = false,
  onClick,
}) => {
  const accentColor = `var(${colorToken})`;
  const bgColor = `var(${bgToken})`;

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

      {/* Header: Icon + Title */}
      <div className="flex items-center gap-2 mb-1.5 pt-0.5">
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-transform duration-180 ease-out group-hover:scale-[1.03]"
          style={{ background: bgColor, color: accentColor }}
        >
          <Icon name={icon as any} size="xs" />
        </span>
        <h3 className="text-[13px] font-bold text-[var(--text-primary)] font-heading leading-tight truncate">
          {title}
        </h3>
      </div>

      {/* KPI Hero Count & Subtitle Stack */}
      <div className="flex flex-col mt-0.5">
        <span className="text-[23px] font-black text-[var(--text-primary)] font-mono tracking-tight leading-none">
          {count}
        </span>
        <span className="text-[11px] font-semibold text-[var(--text-secondary)] opacity-75 mt-1 truncate">
          {subtitle}
        </span>
      </div>
    </div>
  );
};
